import { useEffect, useState } from "react";
import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";
import { music } from "~/configs";
import WidgetFrame from "./WidgetFrame";

export default function MusicMedium() {
  const [np, setNp] = useState<NowPlayingResponse | null>(null);
  const [artFailed, setArtFailed] = useState(false);

  useEffect(() => nowPlayingService.subscribe(setNp), []);

  useEffect(() => {
    setArtFailed(false);
  }, [np?.track]);

  const track = np?.track;
  const hasTrack = !!track;
  const title = track?.title ?? "재생 중인 곡 없음";
  const artist = track?.artist ?? "";
  const art = track?.artwork || music.cover;
  const showArt = hasTrack && !!art && !artFailed;

  return (
    <WidgetFrame size="medium">
      <div className="flex items-center gap-3 p-3 h-full relative">
        {hasTrack && (
          <span className="absolute top-2 right-2 text-[9px] text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            LIVE
          </span>
        )}
        {showArt ? (
          <img
            src={art}
            alt=""
            className="w-20 h-20 rounded-xl object-cover bg-white/5"
            onError={() => setArtFailed(true)}
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="i-fa-solid:music text-2xl text-white/60" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-white text-base font-semibold truncate">{title}</div>
          {artist && <div className="text-white/70 text-sm truncate">{artist}</div>}
        </div>
      </div>
    </WidgetFrame>
  );
}
