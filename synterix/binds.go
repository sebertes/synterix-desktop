package synterix

type TunnelStarter struct {
	Id         string
	LocalPort  int
	LinkEdgeId string
	LinkToken  string
	LinkHost   string
	LinkPort   int
}

type PageStorageBinder struct {
}

func NewPageStorageBinder() *PageStorageBinder {
	return &PageStorageBinder{}
}

func (p *PageStorageBinder) GetValue(key string) (string, error) {
	return GetValue(key)
}

func (p *PageStorageBinder) SetValue(key string, value string) error {
	return SetValue(key, value)
}

func (p *PageStorageBinder) GetAll() (map[string]string, error) {
	return GetAll()
}

func (p *PageStorageBinder) SetAll(values map[string]string) error {
	return SetAll(values)
}

type KubeServerBinder struct {
	server *KubeProxyServer
}

func NewKubeServerBinder(server *KubeProxyServer) *KubeServerBinder {
	return &KubeServerBinder{
		server: server,
	}
}

func (s *KubeServerBinder) Toggle(token string, edgeId string) {
	s.server.Toggle(token, edgeId)
}

func (s *KubeServerBinder) GetInfo() map[string]string {
	return s.server.GetInfo()
}

type TunnelManagerBinder struct {
	manager *TunnelManager
}

func NewTunnelBinder(manager *TunnelManager) *TunnelManagerBinder {
	return &TunnelManagerBinder{
		manager: manager,
	}
}

func (s *TunnelManagerBinder) Start(params TunnelStarter) (map[string]string, error) {
	tunnel, err := s.manager.StartTunnel(params.Id, params.LocalPort, params.LinkEdgeId, params.LinkToken, params.LinkHost, params.LinkPort)
	if err != nil {
		return tunnel.GetInfo(), nil
	}
	return nil, err
}

func (s *TunnelManagerBinder) Stop(id string) error {
	return s.manager.StopTunnel(id)
}

func (s *TunnelManagerBinder) GetTunnels() map[string]map[string]string {
	return s.manager.GetTunnelInfos()
}

type ManagerBinder struct {
	manager *Manager
}

func NewManagerBinder(manager *Manager) *ManagerBinder {
	return &ManagerBinder{
		manager: manager,
	}
}

func (p *ManagerBinder) SetSynterixURL(url string) error {
	return p.manager.SetSynterixURL(url)
}
