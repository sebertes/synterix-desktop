package synterix

import (
	"bytes"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"runtime"
)

type EventType string
type TunnelEventType string

type TunnelEvent struct {
	TunnelEventType TunnelEventType
	Target          string
}

type KubeEvent struct {
	EventType EventType
}

const (
	Started       EventType       = "started"
	Stopped       EventType       = "stopped"
	Toggled       EventType       = "toggled"
	TunnelStarted TunnelEventType = "tunnelStarted"
	TunnelStopped TunnelEventType = "tunnelStopped"
)

func GetFreePort() (int, error) {
	for i := 0; i < 10; i++ { // 尝试最多10次
		port, err := tryGetFreePort()
		if err == nil {
			return port, nil
		}
	}
	return 0, fmt.Errorf("could not find a free port after 10 attempts")
}

func tryGetFreePort() (int, error) {
	l, err := net.Listen("tcp", ":0")
	if err != nil {
		return 0, err
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port, nil
}

func GetHash(s string) (string, error) {
	h := fnv.New64a()
	_, err := h.Write([]byte(s))
	if err != nil {
		return "", err
	}
	hashValue := h.Sum64()
	return fmt.Sprintf("%s", hashValue), nil
}

func Post(remote string, data interface{}) (string, error) {
	jsonData, _ := json.Marshal(data)
	resp, err := http.Post(remote, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	return string(body), nil
}

func ToWebSocketURL(input string) (string, error) {
	u, err := url.Parse(input)
	if err != nil {
		return "", err
	}

	switch u.Scheme {
	case "http":
		u.Scheme = "ws"
	case "https":
		u.Scheme = "wss"
	default:
		u.Scheme = "wss"
	}

	return u.String(), nil
}

func getAppDataPath(appName string) (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	var dataPath string
	switch runtime.GOOS {
	case "darwin":
		dataPath = filepath.Join(homeDir, "Library", "Application Support", appName)
	case "windows":
		dataPath = filepath.Join(homeDir, "AppData", "Roaming", appName)
	default:
		dataPath = filepath.Join(homeDir, ".local", "share", appName)
	}

	if err := os.MkdirAll(dataPath, 0755); err != nil {
		return "", err
	}

	return dataPath, nil
}
