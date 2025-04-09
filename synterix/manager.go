package synterix

import (
	"context"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const (
	KubePort int = 60507
	PagePort int = 60508
)

type Manager struct {
	kubServer           *KubeProxyServer
	pageServer          *PageServer
	tunnelManager       *TunnelManager
	StorageBinder       *PageStorageBinder
	KubeServerBinder    *KubeServerBinder
	TunnelManagerBinder *TunnelManagerBinder
}

func NewManager() *Manager {
	InitDB()
	kubeAddr := fmt.Sprintf("http://localhost:%d", KubePort)
	kubeSever := NewKubeServer(KubePort, "", "synterix", "edge-1")
	pageServer := NewPageService(PagePort, "", kubeAddr)
	tunnelManager := NewTunnelManager("")
	storageBinder := NewPageStorageBinder()
	kubeServerBinder := NewKubeServerBinder(kubeSever)
	tunnelManagerBinder := NewTunnelBinder(tunnelManager)

	return &Manager{
		kubServer:           kubeSever,
		pageServer:          pageServer,
		tunnelManager:       tunnelManager,
		StorageBinder:       storageBinder,
		KubeServerBinder:    kubeServerBinder,
		TunnelManagerBinder: tunnelManagerBinder,
	}
}

func (s *Manager) SetContext(ctx context.Context) {
	s.tunnelManager.On(TunnelStarted, func(e TunnelEvent) {
		runtime.EventsEmit(ctx, string(e.TunnelEventType), s.tunnelManager.GetTunnelInfos())
	})
	s.tunnelManager.On(TunnelStopped, func(e TunnelEvent) {
		runtime.EventsEmit(ctx, string(e.TunnelEventType), s.tunnelManager.GetTunnelInfos())
	})
	s.kubServer.On(Toggled, func(e KubeEvent) {
		runtime.EventsEmit(ctx, string(e.EventType), s.kubServer.GetInfo())
	})
}

func (s *Manager) SetSynterixURL(url string) error {
	_, err := Post(fmt.Sprintf("%s/admin/ready", url), nil)
	if err != nil {
		return err
	}
	err = SetValue("centerTunnelUrl", url)
	if err != nil {
		return err
	}
	return s.Start()
}

func (s *Manager) Start() error {
	go func() {
		values, _ := GetAll()
		synterixURL, _ := values["centerTunnelUrl"]
		if synterixURL == "" {
			return
		}
		s.kubServer.SetSynterixURL(synterixURL)
		s.pageServer.SetSynterixURL(synterixURL)
		s.tunnelManager.SetSynterixURL(synterixURL)
		s.tunnelManager.Start()
		err := s.kubServer.Start()
		if err != nil {
			return
		}
		err = s.pageServer.Start()
		if err != nil {
			return
		}
	}()
	return nil
}

func (s *Manager) Stop() {
	err := s.pageServer.Stop()
	if err != nil {
		return
	}
	err = s.kubServer.Stop()
	if err != nil {
		return
	}
	s.tunnelManager.Stop()
}
