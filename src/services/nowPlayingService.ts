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
  private reconnectAttempts: number = 0; // 누적 재연결 시도 횟수
  private readonly MAX_RECONNECT_ATTEMPTS: number = 5; // 콘솔 도배 방지용 상한
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
  }

  private notifyListeners(data: NowPlayingResponse | null) {
    this.lastData = data;
    this.listeners.forEach((listener) => listener(data));
  }

  // 데이터 구독 (자동으로 연결 시작)
  subscribe(listener: NowPlayingListener): () => void {
    this.listeners.add(listener);

    // 첫 구독자가 등록되면 자동으로 연결 시작
    if (!this.autoConnected) {
      this.autoConnected = true;
      this.shouldReconnect = true;
      this.reconnectAttempts = 0;
      this.attemptConnection();
    } else if (this.lastData !== null) {
      // 이미 데이터가 있으면 즉시 전달
      listener(this.lastData);
    }

    // cleanup 함수 반환
    return () => {
      this.listeners.delete(listener);
      // 구독자가 모두 사라지면 WS 연결과 재연결 타이머를 정리한다.
      if (this.listeners.size === 0) {
        this.disconnect();
      }
    };
  }

  private disconnect(): void {
    this.shouldReconnect = false;
    this.autoConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      try {
        if (
          this.ws.readyState === WebSocket.OPEN ||
          this.ws.readyState === WebSocket.CONNECTING
        ) {
          this.ws.close();
        }
      } catch {
        // ignore close errors
      }
      this.ws = null;
    }

    this.lastData = null;
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
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close();
      }
      this.ws = null;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0; // 성공 시 카운터 리셋
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
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.isConnecting = false;
      this.notifyListeners(null);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      // 한 번만 안내하고 추가 재시도 중단 — 콘솔 도배 방지
      console.warn(
        `NowPlayingService: 재연결 ${this.MAX_RECONNECT_ATTEMPTS}회 실패, 자동 재연결 중단`
      );
      this.shouldReconnect = false;
      return;
    }
    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => {
      this.attemptConnection();
    }, this.reconnectDelay);
  }
}

export const nowPlayingService = new NowPlayingService();
