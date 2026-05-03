import { useRef, useEffect, useState } from "react";
import music from "~/configs/music";
import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";
import { audioPreviewService } from "~/services/audioPreviewService";

export default function MusicWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [showPreviewBar, setShowPreviewBar] = useState(false); // 미리듣기 바 표시 여부
  const [lastTrackId, setLastTrackId] = useState<string>(""); // 곡 변경 감지용
  const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);
  const [useLiveData, setUseLiveData] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태
  const [apiFailed, setApiFailed] = useState(false); // API 실패 여부
  const [isTitleOverflow, setIsTitleOverflow] = useState(false); // 제목이 넘치는지
  const titleRef = useRef<HTMLHeadingElement>(null);
  const measureRef = useRef<HTMLHeadingElement>(null);

  // 오디오 프리뷰 상태 구독
  useEffect(() => {
    const unsubscribe = audioPreviewService.subscribe((audioState) => {
      setIsPlaying(audioState.isPlaying);
      setPreviewCurrentTime(audioState.currentTime);
      setPreviewDuration(audioState.duration);
      if (audioState.isPlaying) {
        setShowPreviewBar(true);
      }
    });

    return unsubscribe;
  }, []);

  // 백엔드에서 실시간 재생 정보 구독
  useEffect(() => {
    const unsubscribe = nowPlayingService.subscribe((data) => {
      setIsLoading(false); // 첫 응답 받으면 로딩 종료

      if (data && data.isPlaying && data.track) {
        const trackId = `${data.track.title}-${data.track.artist}`;

        // 곡이 바뀌었는지 확인
        if (trackId !== lastTrackId) {
          setLastTrackId(trackId);
          setShowPreviewBar(false); // 곡 바뀌면 미리듣기 바 숨김
          audioPreviewService.pause(); // 미리듣기 중지

          // previewUrl 설정
          const previewUrl = data.track.previewUrl || music.audio;
          if (previewUrl) {
            audioPreviewService.setSource(previewUrl);
          }
        }

        setNowPlaying(data);
        setUseLiveData(true);
        setApiFailed(false);

        // currentTime이 duration을 초과하지 않도록 제한
        const safeDuration = data.track.duration;
        const safeCurrentTime = Math.min(data.track.currentTime, safeDuration);

        setCurrentTime(safeCurrentTime);
        setDuration(safeDuration);
      } else if (data === null) {
        // WebSocket 연결 실패
        setUseLiveData(false);
        setApiFailed(true);
      } else {
        // 재생 중이 아님
        setUseLiveData(false);
      }
    });

    return unsubscribe;
  }, [lastTrackId]);

  // 라이브 데이터일 때 1초씩 currentTime 증가
  useEffect(() => {
    if (!useLiveData) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        // 곡 끝에 도달하면 멈춤 (다음 곡 올 때까지)
        if (prev >= duration) {
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [useLiveData, duration]);

  const togglePlay = () => {
    audioPreviewService.togglePlay();
  };

  const skipForward = () => {
    audioPreviewService.skipForward(10);
  };

  const skipBackward = () => {
    audioPreviewService.skipBackward(10);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 표시할 곡 정보 결정
  const shouldShowFallback = apiFailed && !useLiveData;
  const displayTitle =
    useLiveData && nowPlaying?.track
      ? nowPlaying.track.title
      : shouldShowFallback
        ? music.title
        : "";
  const displayArtist =
    useLiveData && nowPlaying?.track
      ? nowPlaying.track.artist
      : shouldShowFallback
        ? music.artist
        : "";
  const displayArtwork =
    useLiveData && nowPlaying?.track
      ? nowPlaying.track.artwork
      : shouldShowFallback
        ? music.cover
        : "";
  const trackUrl = useLiveData && nowPlaying?.track?.url ? nowPlaying.track.url : null;

  // 초기 로드 시 프리뷰 URL 설정
  useEffect(() => {
    if (shouldShowFallback && music.audio) {
      audioPreviewService.setSource(music.audio);
    }
  }, [shouldShowFallback]);

  // Progress percentage 계산
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const previewProgressPercent =
    previewDuration > 0 ? (previewCurrentTime / previewDuration) * 100 : 0;

  // Apple Music 링크 열기
  const openTrackUrl = () => {
    if (trackUrl) {
      window.open(trackUrl, "_blank");
    }
  };

  // 제목이 넘치는지 확인
  useEffect(() => {
    if (measureRef.current) {
      const isOverflow = measureRef.current.scrollWidth > 280;
      setIsTitleOverflow(isOverflow);
    }
  }, [displayTitle]);

  return (
    <div className="fixed top-20 left-8 z-[5]">
      <div className="relative w-[580px] h-[240px] rounded-3xl overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-white/10 to-white/5 shadow-2xl border border-white/20">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-between p-7">
            {/* Album Cover Skeleton */}
            <div className="w-[170px] h-[170px] rounded-2xl bg-white/10 animate-pulse" />

            {/* Content Skeleton */}
            <div className="flex-1 ml-8 space-y-4">
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full animate-pulse" />
              <div className="flex justify-center gap-4 mt-6">
                <div className="w-9 h-9 bg-white/10 rounded-full animate-pulse" />
                <div className="w-11 h-11 bg-white/10 rounded-full animate-pulse" />
                <div className="w-9 h-9 bg-white/10 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Live Indicator */}
        {!isLoading && useLiveData && nowPlaying && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
            <span className="text-white text-xs font-medium">LIVE</span>
          </div>
        )}

        {/* Live Description */}
        {!isLoading && useLiveData && nowPlaying && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-lg">
            <span className="text-white/70 text-xs">
              지금 제가 듣고 있어요! 같이 들어볼까요?
            </span>
          </div>
        )}

        {/* Album Cover */}
        {!isLoading && (shouldShowFallback || (useLiveData && displayArtwork)) && (
          <div
            className={`absolute left-7 top-[55%] -translate-y-1/2 w-[170px] h-[170px] rounded-2xl overflow-hidden shadow-xl z-0 ${
              trackUrl
                ? "cursor-pointer hover:scale-105 transition-transform"
                : "pointer-events-none"
            }`}
            onClick={trackUrl ? openTrackUrl : undefined}
          >
            <img
              src={displayArtwork}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Song Info */}
        {!isLoading && (shouldShowFallback || useLiveData) && (
          <div className="absolute right-7 top-[35%] -translate-y-1/2 w-[280px] z-10">
            {/* Title with marquee effect */}
            <div className="relative mb-1 h-8 overflow-hidden">
              {isTitleOverflow ? (
                // 긴 제목: 무한 스크롤
                <div
                  className={`flex whitespace-nowrap ${
                    trackUrl ? "cursor-pointer hover:text-white/80 transition-colors" : ""
                  }`}
                  onClick={trackUrl ? openTrackUrl : undefined}
                >
                  <h2
                    ref={titleRef}
                    className="text-white text-2xl font-semibold tracking-tight inline-block marquee-title-infinite"
                  >
                    {displayTitle}
                    <span className="inline-block mx-8"></span>
                    {displayTitle}
                    <span className="inline-block mx-8"></span>
                    {displayTitle}
                  </h2>
                </div>
              ) : (
                // 짧은 제목: 고정
                <div
                  className={`text-right whitespace-nowrap ${
                    trackUrl ? "cursor-pointer hover:text-white/80 transition-colors" : ""
                  }`}
                  onClick={trackUrl ? openTrackUrl : undefined}
                >
                  <h2
                    ref={titleRef}
                    className="text-white text-2xl font-semibold tracking-tight inline-block"
                  >
                    {displayTitle}
                  </h2>
                </div>
              )}
            </div>

            {/* Artist */}
            <div className="text-right">
              <p
                className={`text-white/70 text-lg font-medium truncate ${
                  trackUrl ? "cursor-pointer hover:text-white/50 transition-colors" : ""
                }`}
                onClick={trackUrl ? openTrackUrl : undefined}
              >
                {displayArtist}
              </p>
            </div>
          </div>
        )}

        {/* Time Display & Progress Bar */}
        {!isLoading && (shouldShowFallback || useLiveData) && (
          <div className="absolute right-7 top-[52%] -translate-y-1/2 w-[300px] z-10 pointer-events-none">
            <div className="flex justify-between items-center text-white/60 text-sm font-medium mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || 0)}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        {!isLoading && (shouldShowFallback || useLiveData) && (
          <div className="absolute bottom-7 right-7 flex items-center gap-4 z-20">
            <button
              onClick={skipBackward}
              className="text-white/90 hover:text-white transition-all hover:scale-110"
              title="10초 뒤로"
            >
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={togglePlay}
                className="text-white/90 hover:text-white transition-all hover:scale-110 relative group"
                title="미리듣기"
              >
                {isPlaying ? (
                  <svg className="w-11 h-11" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-11 h-11" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  곡 미리듣기 (30초)
                </div>
              </button>

              {/* Preview Progress Bar */}
              {showPreviewBar && (
                <div className="w-20 h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all duration-100"
                    style={{ width: `${previewProgressPercent}%` }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={skipForward}
              className="text-white/90 hover:text-white transition-all hover:scale-110"
              title="10초 앞으로"
            >
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Hidden element for measuring title width */}
      <div className="fixed invisible pointer-events-none">
        <h2
          ref={measureRef}
          className="text-white text-2xl font-semibold tracking-tight whitespace-nowrap"
        >
          {displayTitle}
        </h2>
      </div>
    </div>
  );
}
