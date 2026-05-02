import { useEffect, useState } from "react";
import { weatherService, type WeatherData } from "~/services/weatherService";
import WidgetFrame from "./WidgetFrame";

export default function WeatherSmall() {
  const [w, setW] = useState<WeatherData | null>(null);

  useEffect(() => weatherService.subscribe(setW), []);

  return (
    <WidgetFrame size="small">
      <div className="p-3 h-full flex flex-col justify-between">
        <div className="text-white text-xs opacity-80">{w?.location ?? "—"}</div>
        <div className="text-white text-3xl font-light">
          {w ? `${Math.round(w.temperature)}°` : "--°"}
        </div>
        <div className="text-white text-xs">{w?.description ?? "—"}</div>
      </div>
    </WidgetFrame>
  );
}
