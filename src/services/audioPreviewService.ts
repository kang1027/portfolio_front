// 음악 미리듣기 재생을 관리하는 서비스
// MusicWidget과 ControlCenterMenu 간 재생 상태 동기화

type AudioStateListener = (state: AudioState) => void;

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentUrl: string | null;
}

class AudioPreviewService {
  private audio: HTMLAudioElement;
  private listeners: Set<AudioStateListener> = new Set();
  private state: AudioState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    currentUrl: null
  };

  constructor() {
    this.audio = new Audio();
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('loadedmetadata', this.handleLoadedMetadata);
    this.audio.addEventListener('ended', this.handleEnded);
    this.audio.addEventListener('play', this.handlePlay);
    this.audio.addEventListener('pause', this.handlePause);
  }

  private handleTimeUpdate = () => {
    this.state.currentTime = this.audio.currentTime;
    this.notifyListeners();
  };

  private handleLoadedMetadata = () => {
    this.state.duration = this.audio.duration;
    this.notifyListeners();
  };

  private handleEnded = () => {
    this.state.isPlaying = false;
    this.state.currentTime = 0;
    this.audio.currentTime = 0;
    this.notifyListeners();
  };

  private handlePlay = () => {
    this.state.isPlaying = true;
    this.notifyListeners();
  };

  private handlePause = () => {
    this.state.isPlaying = false;
    this.notifyListeners();
  };

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  // 재생 URL 설정 (곡이 바뀔 때)
  setSource(url: string) {
    if (this.state.currentUrl !== url) {
      this.audio.pause();
      this.audio.src = url;
      this.audio.currentTime = 0;
      this.state.currentUrl = url;
      this.state.currentTime = 0;
      this.state.isPlaying = false;
      this.notifyListeners();
    }
  }

  // 재생/일시정지 토글
  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  // 재생
  play() {
    this.audio.play();
  }

  // 일시정지
  pause() {
    this.audio.pause();
  }

  // 시간 이동
  seek(time: number) {
    this.audio.currentTime = time;
  }

  // 앞으로 스킵
  skipForward(seconds: number = 10) {
    this.audio.currentTime += seconds;
  }

  // 뒤로 스킵
  skipBackward(seconds: number = 10) {
    this.audio.currentTime -= seconds;
  }

  // 상태 구독
  subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    // 즉시 현재 상태 전달
    listener({ ...this.state });

    // cleanup 함수 반환
    return () => {
      this.listeners.delete(listener);
    };
  }

  // 현재 상태 가져오기
  getState(): AudioState {
    return { ...this.state };
  }
}

export const audioPreviewService = new AudioPreviewService();
