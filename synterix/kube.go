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
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

const KubeSvcName = "synterix-kube-proxy"

type KubeProxyServer struct {
	Port          int
	synterixURL   string
	EdgeId        string
	Token         string
	headers       map[string]string
	server        *net.TCPListener
	connected     bool
	stopChan      chan struct{}
	events        chan KubeEvent
	eventHandlers map[EventType][]func(event KubeEvent)
	headerVersion int64
	headerLock    sync.RWMutex
	waitGroup     sync.WaitGroup
}

func NewKubeServer(port int, synterixURL string, token string, edgeId string) *KubeProxyServer {
	s := &KubeProxyServer{
		Port:          port,
		synterixURL:   synterixURL,
		EdgeId:        edgeId,
		Token:         token,
		connected:     false,
		stopChan:      make(chan struct{}),
		events:        make(chan KubeEvent),
		eventHandlers: make(map[EventType][]func(event KubeEvent)),
		headerVersion: 0,
		waitGroup:     sync.WaitGroup{},
	}
	return s
}

func (s *KubeProxyServer) getHeaders() http.Header {
	headers := make(http.Header)
	if strings.TrimSpace(s.EdgeId) == "" {
		headers.Add("x-tunnel-type", "cnt")
		headers.Add("x-tunnel-token", s.Token)
		headers.Add("x-tunnel-link-svc", KubeSvcName)
	} else {
		headers.Add("x-tunnel-type", "lnk")
		headers.Add("x-tunnel-token", s.Token)
		headers.Add("x-tunnel-link-edge", s.EdgeId)
		headers.Add("x-tunnel-link-svc", KubeSvcName)
	}
	return headers
}

func (s *KubeProxyServer) SetSynterixURL(url string) {
	s.synterixURL = url
}

func (s *KubeProxyServer) Start() error {
	if s.connected {
		err := s.Stop()
		if err != nil {
			return err
		}
	}
	addr := fmt.Sprintf(":%d", s.Port)
	tcpAddr, err := net.ResolveTCPAddr("tcp", addr)
	if err != nil {
		return fmt.Errorf("tcp host not valid: %v", err)
	}

	listener, err := net.ListenTCP("tcp", tcpAddr)
	if err != nil {
		return fmt.Errorf("tcp listen:%d failed: %v", s.Port, err)
	}

	s.server = listener
	s.connected = true
	log.Printf("tcp listened:%d", s.Port)
	go func() {
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
				s.waitGroup.Add(1)
				go func(tcpConn *net.TCPConn) {
					defer s.waitGroup.Done()
					defer tcpConn.Close()

					log.Println("tcp server started,to connect websocket")

					dialer := websocket.DefaultDialer
					wsURL, _ := ToWebSocketURL(s.synterixURL)
					wsConn, _, err := dialer.Dial(fmt.Sprintf("%s/gateway", wsURL), s.getHeaders())
					if err != nil {
						log.Printf("websocket connect error: %v", err)
						return
					}
					defer func() {
						log.Println("websocket connect closed")
						wsConn.Close()
					}()

					log.Println("websocket connected")

					ctx, cancel := context.WithCancel(context.Background())
					defer cancel()

					myVersion := atomic.LoadInt64(&s.headerVersion)

					ticker := time.NewTicker(5 * time.Second)
					defer ticker.Stop()

					go func() {
						reader := bufio.NewReader(tcpConn)
						buf := make([]byte, 4096)
						defer log.Println("tcp connect closed")
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
									log.Printf("webscoekt send message error: %v", err)
									cancel()
									return
								}
							}
						}
					}()

					// 读取 WS → TCP
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
								log.Printf("not support websocket message type: %d", msgType)
								continue
							}
							msgChan <- message
						}
					}()

					for {
						select {
						case <-ctx.Done():
							return
						case <-ticker.C:
							if myVersion < atomic.LoadInt64(&s.headerVersion) {
								log.Println("headers updated,close old connect")
								cancel()
								return
							}
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
	go func() {
		for e := range s.events {
			if handler, ok := s.eventHandlers[e.EventType]; ok {
				for _, handler := range handler {
					handler(e)
				}
			}
		}
	}()
	return nil
}

func (s *KubeProxyServer) Stop() error {
	if s.server == nil {
		return nil
	}

	close(s.stopChan)
	err := s.server.Close()
	if err != nil {
		return fmt.Errorf("关闭TCP服务器错误: %v", err)
	}

	s.connected = false
	s.events <- KubeEvent{
		EventType: Stopped,
	}

	close(s.events)
	log.Println("TCP服务器已停止")
	return nil
}

func (s *KubeProxyServer) Toggle(token string, edgeId string) {
	s.headerLock.Lock()
	defer s.headerLock.Unlock()

	if s.EdgeId == edgeId {
		return
	}

	atomic.AddInt64(&s.headerVersion, 1)

	s.Token = token
	s.EdgeId = edgeId

	if s.headerVersion > 1 {
		s.waitGroup.Wait()
		log.Println("all old closed")
	}

	s.events <- KubeEvent{
		EventType: Toggled,
	}
}

func (s *KubeProxyServer) GetInfo() map[string]string {
	r := make(map[string]string)
	r["x-tunnel-type"] = func() string {
		if strings.TrimSpace(s.EdgeId) == "" {
			return "cnt"
		}
		return "lnk"
	}()
	r["x-tunnel-token"] = s.Token
	r["x-tunnel-link-edge"] = s.EdgeId
	r["x-tunnel-link-svc"] = KubeSvcName
	return r
}

func (s *KubeProxyServer) On(eventType EventType, handler func(event KubeEvent)) {
	if _, ok := s.eventHandlers[eventType]; !ok {
		s.eventHandlers[eventType] = make([]func(event KubeEvent), 0)
	}
	s.eventHandlers[eventType] = append(s.eventHandlers[eventType], handler)
}
