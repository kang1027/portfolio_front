// 백엔드에서 현재 재생 중인 곡 정보 가져오기 (WebSocket)

export interface NowPlayingTrack {
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number;
  currentTime: number;
  url?: string; // Apple Music 트랙 URL
  previewUrl?: string; // 미리듣기 URL
}

export interface NowPlayingResponse {
  isPlaying: boolean;
  track: NowPlayingTrack | null;
  timestamp: number;
}

type NowPlayingListener = (data: NowPlayingResponse | null) => void;

class NowPlayingService {
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectDelay: number = 3000; // 3초 후 재연결
  private isConnecting: boolean = false; // 연결 중 상태 추적
  private shouldReconnect: boolean = true; // 재연결 여부 플래그
  private listeners: Set<NowPlayingListener> = new Set();
  private lastData: NowPlayingResponse | null = null;
  private autoConnected: boolean = false; // 자동 연결 여부

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    // HTTP -> WS, HTTPS -> WSS 변환
    // https:// -> wss://, http:// -> ws://
    let wsProtocol = "ws://";
    if (apiUrl.startsWith("https://")) {
      wsProtocol = "wss://";
    }

    const hostname = apiUrl.replace(/^https?:\/\//, "");
    this.wsUrl = wsProtocol + hostname + "/ws/now-playing";

    console.log("[NowPlayingService] API URL:", apiUrl);
    console.log("[NowPlayingService] WebSocket URL:", this.wsUrl);
  }

  private notifyListeners(data: NowPlayingResponse | null) {
    this.lastData = data;
    this.listeners.forEach(listener => listener(data));
  }

  // 데이터 구독 (자동으로 연결 시작)
  subscribe(listener: NowPlayingListener): () => void {
    this.listeners.add(listener);

    // 첫 구독자가 등록되면 자동으로 연결 시작
    if (!this.autoConnected) {
      this.autoConnected = true;
      this.shouldReconnect = true;
      this.attemptConnection();
    } else if (this.lastData !== null) {
      // 이미 데이터가 있으면 즉시 전달
      listener(this.lastData);
    }

    // cleanup 함수 반환
    return () => {
      this.listeners.delete(listener);
    };
  }

  private attemptConnection(): void {
    // 기존 타이머 정리
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // 기존 연결 정리
    if (this.ws) {
      this.ws.onclose = null; // 이벤트 핸들러 제거하여 재연결 방지
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected to", this.wsUrl);
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data: NowPlayingResponse = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          this.notifyListeners(null);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
        this.notifyListeners(null);
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.ws = null;

        // shouldReconnect가 true일 때만 재연결
        if (this.shouldReconnect) {
          this.reconnectTimeout = setTimeout(() => {
            this.attemptConnection();
          }, this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.isConnecting = false;
      this.notifyListeners(null);

      // 연결 실패 시 재시도 (shouldReconnect가 true일 때만)
      if (this.shouldReconnect) {
        this.reconnectTimeout = setTimeout(() => {
          this.attemptConnection();
        }, this.reconnectDelay);
      }
    }
  }
}

export const nowPlayingService = new NowPlayingService();
