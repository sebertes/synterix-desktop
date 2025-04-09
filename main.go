package main

import (
	"bytes"
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"github.com/kbinani/screenshot"
	"github.com/sebertes/synterix-desktop/synterix"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"net/http"
	"regexp"
	"strings"
)

//go:embed all:frontend/build
var assets embed.FS
var appCtx context.Context

func main() {
	bounds := screenshot.GetDisplayBounds(0) // 0 表示主屏幕
	screenWidth := bounds.Dx()
	screenHeight := bounds.Dy()

	appMenu := menu.NewMenu()
	fileMenu := appMenu.AddSubmenu("File")
	fileMenu.AddText("About Synterix", keys.CmdOrCtrl("n"), func(_ *menu.CallbackData) {
		_, err := runtime.MessageDialog(appCtx, runtime.MessageDialogOptions{
			Title:   "App Synterix",
			Message: "Synterix is a cutting-edge software solution designed to address the challenges of unified operations and maintenance (O&M) for SaaS services following privatization deployment.\n It operates on Kubernetes (k8s) and is divided into a central cluster and edge clusters, offering a seamless, zero-invasion approach to managing distributed SaaS deployments.\nSynterix is free and open source software released under the MIT license",
		})
		if err != nil {
			return
		}
	})
	fileMenu.AddSeparator()
	fileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		result, _ := runtime.MessageDialog(appCtx, runtime.MessageDialogOptions{
			Title:   "Quit?",
			Message: "Are you sure you want to quit?",
			Buttons: []string{"Cancel", "Quit"},
		})
		if result == "Quit" {
			runtime.Quit(appCtx)
		}
	})
	editMenu := appMenu.AddSubmenu("Edit")
	editMenu.AddText("Cut", keys.CmdOrCtrl("x"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(appCtx, "cut")
	})
	editMenu.AddText("Copy", keys.CmdOrCtrl("c"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(appCtx, "copy")
	})
	editMenu.AddText("Paste", keys.CmdOrCtrl("v"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(appCtx, "paste")
	})

	app := NewApp()
	manager := synterix.NewManager()
	managerBinder := synterix.NewManagerBinder(manager)
	err := wails.Run(&options.App{
		Title:    "synterix",
		Width:    int(float64(screenWidth) * 0.9),
		Height:   int(float64(screenHeight) * 0.7),
		Menu:     appMenu,
		LogLevel: logger.ERROR,
		AssetServer: &assetserver.Options{
			Assets: assets,
			Middleware: func(next http.Handler) http.Handler {
				return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					accept := r.Header.Get("Accept")
					if strings.Contains(accept, "text/html") {
						values, _ := synterix.GetAll()
						rw := &responseInterceptor{ResponseWriter: w, buf: &bytes.Buffer{}}
						next.ServeHTTP(rw, r)
						content := rw.buf.String()
						jsonStr, _ := json.Marshal(values)
						jsCode := fmt.Sprintf(`window.localStorage.port=%d;window.localStorage.setting=JSON.stringify(%s);console.log('injected');`, synterix.PagePort, jsonStr)
						re := regexp.MustCompile(`data-theme=(['"])(dark|light)(['"])`)
						content = re.ReplaceAllString(content, `data-theme=${1}`+values["theme"]+`${1}`)
						injected := strings.Replace(content, "</head>", "<script>"+jsCode+"</script></head>", 1)
						w.Header().Set("Content-Type", "text/html")
						w.WriteHeader(http.StatusOK)
						w.Write([]byte(injected))
					} else {
						next.ServeHTTP(w, r)
					}
				})
			},
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 1},
		OnStartup: func(ctx context.Context) {
			appCtx = ctx
			app.startup(ctx)
			manager.SetContext(ctx)
			err := manager.Start()
			if err != nil {
				return
			}
		},
		OnShutdown: func(ctx context.Context) {
			manager.Stop()
		},
		Bind: []interface{}{
			app,
			manager.StorageBinder,
			manager.KubeServerBinder,
			manager.TunnelManagerBinder,
			managerBinder,
		},
	})
	if err != nil {
		panic(err)
	}
}

type responseInterceptor struct {
	http.ResponseWriter
	buf *bytes.Buffer
}

func (r *responseInterceptor) Write(b []byte) (int, error) {
	return r.buf.Write(b)
}
