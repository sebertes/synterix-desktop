package synterix

import (
	"context"
	"github.com/vulcand/oxy/forward"
	"log"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type PageServer struct {
	Port        int
	SynterixURL string
	kubeURL     string
	server      *http.Server
	started     bool
}

func NewPageService(port int, synterixURL string, kubeURL string) *PageServer {
	mux := http.NewServeMux()
	pageServer := &PageServer{
		Port:        port,
		SynterixURL: synterixURL,
		kubeURL:     kubeURL,
		server: &http.Server{
			Addr:         ":" + strconv.Itoa(port),
			Handler:      mux,
			ReadTimeout:  5 * time.Second,
			WriteTimeout: 10 * time.Second,
			IdleTimeout:  15 * time.Second,
		},
	}
	pageProxy, err := forward.New(
		forward.RoundTripper(&http.Transport{
			Proxy: http.ProxyFromEnvironment,
			DialContext: (&net.Dialer{
				Timeout:   30 * time.Second,
				KeepAlive: 30 * time.Second,
			}).DialContext,
			ForceAttemptHTTP2:     true,
			MaxIdleConns:          100,
			IdleConnTimeout:       90 * time.Second,
			TLSHandshakeTimeout:   10 * time.Second,
			ExpectContinueTimeout: 1 * time.Second,
		}),
		forward.PassHostHeader(true),
		forward.Stream(true),
	)
	if err != nil {
		log.Fatalf("yuntuopsTestProxy init failed: %v", err)
	}

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/synterix/") {
			target, _ := url.Parse(pageServer.SynterixURL)
			r.URL.Scheme = target.Scheme
			r.URL.Host = target.Host
			r.Host = target.Host
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "*")
			if r.Method == "OPTIONS" {
				w.WriteHeader(200)
				return
			}
			pageProxy.ServeHTTP(w, r)
			return
		}
		if strings.HasPrefix(r.URL.Path, "/kube/") {
			target, _ := url.Parse(pageServer.kubeURL)
			r.URL.Scheme = target.Scheme
			r.URL.Host = target.Host
			r.Host = target.Host
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "*")
			if r.Method == "OPTIONS" {
				w.WriteHeader(200)
				return
			}
			log.Printf("Proxying to: %s %s, Host: %s", r.Method, r.URL.String(), r.Host)
			pageProxy.ServeHTTP(w, r)
			return
		}
		http.FileServer(http.Dir("./")).ServeHTTP(w, r)
	})

	if port == 0 {
		p, err := GetFreePort()
		if err != nil {
			log.Fatal(err)
		}
		port = p
	}
	return pageServer
}

func (s *PageServer) SetSynterixURL(url string) {
	s.SynterixURL = url
}

func (s *PageServer) Start() error {
	if s.started {
		err := s.Stop()
		if err != nil {
			return err
		}
	}
	s.server = &http.Server{
		Addr:         ":" + strconv.Itoa(s.Port),
		Handler:      s.server.Handler, // 保留 mux 不变
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  15 * time.Second,
	}
	s.started = true

	go func() {
		log.Printf("Starting server on %s\n", s.server.Addr)
		if err := s.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not start server: %v\n", err)
		}
	}()

	return nil
}

func (s *PageServer) Stop() error {
	if !s.started {
		return nil
	}
	s.started = false
	log.Println("Shutting down proxy server...")

	ctxTimeout, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := s.server.Shutdown(ctxTimeout); err != nil {
		log.Printf("Shutdown error: %v\n", err)
		return err
	}

	return nil
}
