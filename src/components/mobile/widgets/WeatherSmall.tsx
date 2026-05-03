import { useEffect, useState } from "react";
import { weatherService, type WeatherData } from "~/services/weatherService";
import WidgetFrame from "./WidgetFrame";

export default function WeatherSmall() {
  const [w, setW] = useState<WeatherData | null>(null);

  useEffect(() => weatherService.subscribe(setW), []);

  return (
    <WidgetFrame size="small">
      <div className="p-3 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-white text-xs opacity-80 truncate">
            {w?.location ?? "—"}
          </span>
          {w && (
            <span className="text-[9px] text-green-400 flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              LIVE
            </span>
          )}
        </div>
        <div className="text-white text-3xl font-light">
          {w ? `${Math.round(w.temperature)}°` : "--°"}
        </div>
        <div className="text-white text-xs truncate">{w?.description ?? "—"}</div>
      </div>
    </WidgetFrame>
  );
}
