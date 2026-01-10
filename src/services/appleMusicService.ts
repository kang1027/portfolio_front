// Apple Music API Service
// Developer Token을 사용하여 Apple Music API와 통신

export interface AppleMusicTrack {
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
}

class AppleMusicService {
  private musicKit: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // MusicKit JS SDK 로드
      await this.loadMusicKitScript();

      // Developer Token 발급 필요
      // 보안상 이유로 서버에서 발급하는 것이 권장됨
      const developerToken = import.meta.env.VITE_APPLE_MUSIC_DEVELOPER_TOKEN;

      if (!developerToken) {
        console.warn("Apple Music Developer Token not found in .env");
        return;
      }

      // MusicKit 초기화
      await (window as any).MusicKit.configure({
        developerToken: developerToken,
        app: {
          name: "Playground macOS",
          build: "1.0.0"
        }
      });

      this.musicKit = (window as any).MusicKit.getInstance();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Apple Music API:", error);
    }
  }

  private loadMusicKitScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 이미 로드되어 있으면 스킵
      if ((window as any).MusicKit) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load MusicKit JS"));
      document.head.appendChild(script);
    });
  }

  async authorize() {
    if (!this.musicKit) {
      await this.initialize();
    }

    try {
      await this.musicKit.authorize();
      return true;
    } catch (error) {
      console.error("Authorization failed:", error);
      return false;
    }
  }

  async getCurrentPlayback(): Promise<AppleMusicTrack | null> {
    if (!this.musicKit || !this.isInitialized) {
      await this.initialize();
    }

    try {
      const nowPlaying = this.musicKit.nowPlayingItem;

      if (!nowPlaying) {
        return null;
      }

      return {
        title: nowPlaying.title || "Unknown",
        artist: nowPlaying.artistName || "Unknown Artist",
        album: nowPlaying.albumName || "Unknown Album",
        artwork: this.getArtworkUrl(nowPlaying.artwork),
        duration: nowPlaying.playbackDuration || 0,
        currentTime: this.musicKit.currentPlaybackTime || 0,
        isPlaying: this.musicKit.isPlaying
      };
    } catch (error) {
      console.error("Failed to get current playback:", error);
      return null;
    }
  }

  private getArtworkUrl(artwork: any): string {
    if (!artwork) return "";

    // Apple Music artwork URL 형식
    const width = 400;
    const height = 400;
    return artwork.url.replace("{w}", width.toString()).replace("{h}", height.toString());
  }

  onPlaybackStateChange(callback: (track: AppleMusicTrack | null) => void) {
    if (!this.musicKit) return;

    this.musicKit.addEventListener("nowPlayingItemDidChange", async () => {
      const track = await this.getCurrentPlayback();
      callback(track);
    });

    this.musicKit.addEventListener("playbackStateDidChange", async () => {
      const track = await this.getCurrentPlayback();
      callback(track);
    });
  }

  onPlaybackTimeChange(callback: (currentTime: number) => void) {
    if (!this.musicKit) return;

    this.musicKit.addEventListener("playbackTimeDidChange", (event: any) => {
      callback(event.currentPlaybackTime);
    });
  }

  isAuthorized(): boolean {
    return this.musicKit?.isAuthorized || false;
  }
}

export const appleMusicService = new AppleMusicService();
