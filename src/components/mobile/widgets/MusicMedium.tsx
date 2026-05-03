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
      <div className="relative h-full overflow-hidden">
        {/* album art blur 배경 — 깊이감 */}
        {showArt && (
          <>
            <img
              src={art}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110"
              style={{ filter: "blur(40px) brightness(0.45) saturate(1.3)" }}
              onError={() => setArtFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40" />
          </>
        )}

        {/* 가로 split: 좌측 큰 art / 우측 vertical-center stack */}
        <div className="relative h-full px-3 py-3 flex items-center gap-3">
          {showArt ? (
            <button
              type="button"
              onClick={openTrackUrl}
              disabled={!trackUrl}
              aria-label={trackUrl ? "트랙 페이지 열기" : "앨범 커버"}
              className={`w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-white/5 shadow-lg shadow-black/40 ${trackUrl ? "active:scale-95 transition-transform" : ""}`}
            >
              <img
                src={art}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setArtFailed(true)}
              />
            </button>
          ) : (
            <div className="w-24 h-24 shrink-0 rounded-xl bg-white/10 flex items-center justify-center shadow-lg shadow-black/40">
              <span className="i-fa-solid:music text-3xl text-white/60" />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white text-sm font-semibold truncate flex-1 leading-tight">
                  {title}
                </span>
                {hasTrack && (
                  <span
                    className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow shadow-green-400/60"
                    aria-label="LIVE"
                  />
                )}
              </div>
              {artist && (
                <div className="text-white/65 text-xs truncate mt-0.5">{artist}</div>
              )}
            </div>

            {hasTrack && dispDuration > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/55 tabular-nums w-8 text-left">
                  {fmt(dispCurrent)}
                </span>
                <div className="flex-1 h-1 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-200 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/55 tabular-nums w-8 text-right">
                  {fmt(dispDuration)}
                </span>
              </div>
            )}

            {hasTrack && (
              <div className="flex items-center justify-center gap-7">
                <button
                  type="button"
                  onClick={() => audioPreviewService.skipBackward(10)}
                  aria-label="10초 뒤로"
                  className="text-white/85 hover:text-white active:scale-90 transition-all p-1"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => audioPreviewService.togglePlay()}
                  aria-label={isPreviewPlaying ? "일시정지" : "30초 미리듣기"}
                  className="text-white active:scale-90 transition-transform p-1"
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
                  className="text-white/85 hover:text-white active:scale-90 transition-all p-1"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
