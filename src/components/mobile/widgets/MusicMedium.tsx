import { useEffect, useState } from "react";
import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";
import { music } from "~/configs";
import WidgetFrame from "./WidgetFrame";

export default function MusicMedium() {
  const [np, setNp] = useState<NowPlayingResponse | null>(null);

  useEffect(() => nowPlayingService.subscribe(setNp), []);

  const track = np?.track;
  const title = track?.title ?? "Now Playing";
  const artist = track?.artist ?? "—";
  const art = track?.artwork || music.cover;

  return (
    <WidgetFrame size="medium">
      <div className="flex items-center gap-3 p-3 h-full">
        <img src={art} alt="" className="w-20 h-20 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <div className="text-white text-base font-semibold truncate">{title}</div>
          <div className="text-white/70 text-sm truncate">{artist}</div>
        </div>
      </div>
    </WidgetFrame>
  );
}
