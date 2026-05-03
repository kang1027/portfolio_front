import { useEffect, useState } from "react";
import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";
import { audioPreviewService } from "~/services/audioPreviewService";
import { music } from "~/configs";
import WidgetFrame from "./WidgetFrame";

const fmt = (t: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function MusicMedium() {
  const [np, setNp] = useState<NowPlayingResponse | null>(null);
  const [useLive, setUseLive] = useState(false);
  const [artFailed, setArtFailed] = useState(false);
  const [lastTrackId, setLastTrackId] = useState<string>("");

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewCurrent, setPreviewCurrent] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [showPreviewBar, setShowPreviewBar] = useState(false);

  useEffect(() => {
    return audioPreviewService.subscribe((s) => {
      setIsPreviewPlaying(s.isPlaying);
      setPreviewCurrent(s.currentTime);
      setPreviewDuration(s.duration);
      if (s.isPlaying) setShowPreviewBar(true);
    });
  }, []);

  useEffect(() => {
    return nowPlayingService.subscribe((data) => {
      if (data?.isPlaying && data.track) {
        const trackId = `${data.track.title}-${data.track.artist}`;
        if (trackId !== lastTrackId) {
          setLastTrackId(trackId);
          // 곡이 바뀌면 미리듣기는 멈추고 다시 라이브 표시로 복귀
          setShowPreviewBar(false);
          audioPreviewService.pause();
          const previewUrl = data.track.previewUrl || music.audio;
          if (previewUrl) audioPreviewService.setSource(previewUrl);
        }
        setNp(data);
        setUseLive(true);
        setCurrentTime(Math.min(data.track.currentTime, data.track.duration));
        setDuration(data.track.duration);
      } else {
        setUseLive(false);
      }
    });
  }, [lastTrackId]);

  useEffect(() => {
    if (!useLive) return;
    const id = setInterval(() => {
      setCurrentTime((p) => (p >= duration ? p : p + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [useLive, duration]);

  useEffect(() => {
    setArtFailed(false);
  }, [np?.track]);

  const track = np?.track;
  const hasTrack = !!track;
  const title = track?.title ?? "재생 중인 곡 없음";
  const artist = track?.artist ?? "";
  const art = track?.artwork || music.cover;
  const showArt = hasTrack && !!art && !artFailed;
  const trackUrl = track?.url || null;

  // 미리듣기 재생 중이면 진행바를 미리듣기 시간으로 전환
  const showingPreview = showPreviewBar && previewDuration > 0;
  const dispCurrent = showingPreview ? previewCurrent : currentTime;
  const dispDuration = showingPreview ? previewDuration : duration;
  const progress = dispDuration > 0 ? (dispCurrent / dispDuration) * 100 : 0;

  const openTrackUrl = () => {
    if (trackUrl) window.open(trackUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <WidgetFrame size="medium">
      <div className="relative h-full p-3 flex gap-3">
        {hasTrack && (
          <span className="absolute top-2 right-2 text-[9px] text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
        )}
        {showArt ? (
          <button
            type="button"
            onClick={openTrackUrl}
            disabled={!trackUrl}
            aria-label={trackUrl ? "트랙 페이지 열기" : "앨범 커버"}
            className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-white/5 ${trackUrl ? "active:scale-95 transition-transform" : ""}`}
          >
            <img
              src={art}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setArtFailed(true)}
            />
          </button>
        ) : (
          <div className="w-20 h-20 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="i-fa-solid:music text-2xl text-white/60" />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="min-w-0 pr-10">
            <div className="text-white text-sm font-semibold truncate">{title}</div>
            {artist && <div className="text-white/70 text-xs truncate">{artist}</div>}
          </div>

          {hasTrack && dispDuration > 0 && (
            <div className="space-y-0.5">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-200 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/60">
                <span>{fmt(dispCurrent)}</span>
                <span>{fmt(dispDuration)}</span>
              </div>
            </div>
          )}

          {hasTrack && (
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => audioPreviewService.skipBackward(10)}
                aria-label="10초 뒤로"
                className="text-white/90 active:scale-90 transition-transform"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => audioPreviewService.togglePlay()}
                aria-label={isPreviewPlaying ? "일시정지" : "30초 미리듣기"}
                className="text-white active:scale-90 transition-transform"
              >
                {isPreviewPlaying ? (
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => audioPreviewService.skipForward(10)}
                aria-label="10초 앞으로"
                className="text-white/90 active:scale-90 transition-transform"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </WidgetFrame>
  );
}
