package synterix

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
)

type Tunnel struct {
	id          string
	SynterixURL string
	Port        int
	linkEdgeId  string
	linkToken   string
	linkHost    string
	linkPort    int
	server      *net.TCPListener
	connected   bool
	wg          sync.WaitGroup
	stopChan    chan struct{}
	events      chan TunnelEvent
}

func NewTunnel(id string, event chan TunnelEvent, port int, synterixURL string, linkEdgeId string, linkToken string, linkHost string, linkPort int) *Tunnel {
	return &Tunnel{
		id:          id,
		SynterixURL: synterixURL,
		Port:        port,
		linkEdgeId:  linkEdgeId,
		linkToken:   linkToken,
		linkHost:    linkHost,
		linkPort:    linkPort,
		stopChan:    make(chan struct{}),
		events:      event,
	}
}

func (s *Tunnel) getHeaders() http.Header {
	headers := make(http.Header)
	if strings.TrimSpace(s.linkEdgeId) == "" {
		headers.Add("x-tunnel-type", "cnt")
		headers.Add("x-tunnel-token", s.linkToken)
		headers.Add("x-tunnel-link-host", s.linkHost)
		headers.Add("x-tunnel-link-port", strconv.Itoa(s.linkPort))
	} else {
		headers.Add("x-tunnel-type", "lnk")
		headers.Add("x-tunnel-token", s.linkToken)
		headers.Add("x-tunnel-link-edge", s.linkEdgeId)
		headers.Add("x-tunnel-link-host", s.linkHost)
		headers.Add("x-tunnel-link-port", strconv.Itoa(s.linkPort))
	}
	return headers
}

func (s *Tunnel) Start() error {
	if s.connected {
		return nil
	}
	addr := fmt.Sprintf(":%d", s.Port)
	tcpAddr, err := net.ResolveTCPAddr("tcp", addr)
	if err != nil {
		return fmt.Errorf("tcp host not valid: %v", err)
	}

	listener, err := net.ListenTCP("tcp", tcpAddr)
	if err != nil {
		return fmt.Errorf("tcp listen:%d faield: %v", s.Port, err)
	}

	s.server = listener
	s.connected = true
	s.events <- TunnelEvent{
		TunnelEventType: TunnelStarted,
		Target:          s.id,
	}
	log.Printf("tcp server listened:%d", s.Port)

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		for {
			select {
			case <-s.stopChan:
				return
			default:
				conn, err := listener.AcceptTCP()
				if err != nil {
					if errors.Is(err, net.ErrClosed) {
						return
					}
					log.Printf("tcp accept connect error: %v", err)
					continue
				}
				s.wg.Add(1)
				go func(tcpConn *net.TCPConn) {
					defer s.wg.Done()
					defer tcpConn.Close()

					log.Println("tcp started done,to connect websocket")

					dialer := websocket.DefaultDialer
					wsURL, _ := ToWebSocketURL(s.SynterixURL)
					wsConn, _, err := dialer.Dial(fmt.Sprintf("%s/gateway", wsURL), s.getHeaders())
					if err != nil {
						log.Printf("websocket connect error: %v", err)
						tcpConn.Close()
						return
					}
					defer func() {
						log.Println("websocket disconnect")
						wsConn.Close()
					}()

					log.Println("websocket connected")

					ctx, cancel := context.WithCancel(context.Background())
					defer cancel()

					go func() {
						reader := bufio.NewReader(tcpConn)
						buf := make([]byte, 4096)
						defer log.Println("tcp disconnect")
						for {
							select {
							case <-ctx.Done():
								return
							default:
								n, err := reader.Read(buf)
								if err != nil {
									cancel()
									return
								}
								err = wsConn.WriteMessage(websocket.BinaryMessage, buf[:n])
								if err != nil {
									log.Printf("websocket send message error: %v", err)
									cancel()
									return
								}
							}
						}
					}()
					msgChan := make(chan []byte, 1)
					errChan := make(chan error, 1)

					go func() {
						for {
							msgType, message, err := wsConn.ReadMessage()
							if err != nil {
								errChan <- err
								return
							}
							if msgType != websocket.BinaryMessage {
								log.Printf("no support message type: %d", msgType)
								continue
							}
							msgChan <- message
						}
					}()

					for {
						select {
						case <-ctx.Done():
							return
						case msg := <-msgChan:
							_, err := tcpConn.Write(msg)
							if err != nil {
								log.Printf("tcp send message error: %v", err)
								cancel()
								return
							}
						case err := <-errChan:
							log.Printf("websocket read error: %v", err)
							cancel()
							return
						}
					}
				}(conn)
			}
		}
	}()

	return nil
}

func (s *Tunnel) Stop() error {
	if s.server == nil {
		return nil
	}

	close(s.stopChan)
	err := s.server.Close()
	if err != nil {
		return fmt.Errorf("close tcp error: %v", err)
	}

	s.wg.Wait()
	s.connected = false
	s.events <- TunnelEvent{
		TunnelEventType: TunnelStopped,
		Target:          s.id,
	}
	log.Println("tcp server stopped")
	return nil
}

func (s *Tunnel) GetId() string {
	return s.id
}

func (s *Tunnel) GetInfo() map[string]string {
	r := make(map[string]string)
	r["x-tunnel-type"] = func() string {
		if strings.TrimSpace(s.linkEdgeId) == "" {
			return "cnt"
		}
		return "lnk"
	}()
	r["x-tunnel-token"] = s.linkToken
	r["x-tunnel-link-edge"] = s.linkEdgeId
	r["x-tunnel-link-host"] = s.linkHost
	r["x-tunnel-link-port"] = strconv.Itoa(s.linkPort)
	r["state"] = func() string {
		if s.connected {
			return "Running"
		}
		return "Disconnect"
	}()
	r["localPort"] = strconv.Itoa(s.Port)
	return r
}

type TunnelManager struct {
	SynterixURL string
	tunnels     map[string]*Tunnel
	events      chan TunnelEvent
	handlers    map[TunnelEventType]func(event TunnelEvent)
	started     bool
}

func NewTunnelManager(synteixURL string) *TunnelManager {
	events := make(chan TunnelEvent)
	manager := TunnelManager{
		SynterixURL: synteixURL,
		tunnels:     make(map[string]*Tunnel),
		events:      events,
		handlers:    make(map[TunnelEventType]func(event TunnelEvent)),
	}
	return &manager
}

func (s *TunnelManager) SetSynterixURL(url string) {
	s.SynterixURL = url
}

func (s *TunnelManager) Start() {
	if s.started {
		s.Stop()
	}
	s.started = true
	go func() {
		for e := range s.events {
			if h, ok := s.handlers[e.TunnelEventType]; ok {
				h(e)
			}
		}
	}()
}

func (s *TunnelManager) Stop() {
	for _, tunnel := range s.tunnels {
		err := tunnel.Stop()
		if err != nil {
			return
		}
	}

	close(s.events)
}

func (s *TunnelManager) StartTunnel(id string, localPort int, linkEdgeId string, linkToken string, linkHost string, linkPort int) (*Tunnel, error) {
	tunnel, ok := s.tunnels[id]
	if !ok {
		tunnel = NewTunnel(id, s.events, localPort, s.SynterixURL, linkEdgeId, linkToken, linkHost, linkPort)
		s.tunnels[id] = tunnel
		err := tunnel.Start()
		if err != nil {
			return nil, err
		}
	}
	return tunnel, nil
}

func (s *TunnelManager) StopTunnel(id string) error {
	if tunnel, ok := s.tunnels[id]; ok {
		err := tunnel.Stop()
		if err != nil {
			return err
		}
		delete(s.tunnels, id)
	}
	return nil
}

func (s *TunnelManager) GetTunnelInfos() map[string]map[string]string {
	r := make(map[string]map[string]string)
	for _, tunnel := range s.tunnels {
		r[tunnel.GetId()] = tunnel.GetInfo()
	}
	return r
}

func (s *TunnelManager) On(eventType TunnelEventType, handler func(event TunnelEvent)) {
	s.handlers[eventType] = handler
}
