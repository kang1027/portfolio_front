import { useEffect, useState } from "react";
import {
  weatherService,
  type WeatherData,
  type HourlyForecast
} from "~/services/weatherService";
import WidgetFrame from "./WidgetFrame";

const getWeatherType = (iconCode: string): string => {
  if (!iconCode) return "cloudy";
  if (iconCode.startsWith("01")) return "sunny";
  if (iconCode.startsWith("02")) return "partly_cloudy";
  if (iconCode.startsWith("03") || iconCode.startsWith("04")) return "cloudy";
  if (iconCode.startsWith("09") || iconCode.startsWith("10")) return "rainy";
  if (iconCode.startsWith("11")) return "lightning";
  if (iconCode.startsWith("13")) return "snowy";
  return "cloudy";
};

const getWeatherGradient = (iconCode: string): string => {
  const t = getWeatherType(iconCode);
  switch (t) {
    case "sunny":
      return "linear-gradient(135deg, rgba(255,200,100,0.45) 0%, rgba(253,245,150,0.30) 100%)";
    case "partly_cloudy":
      return "linear-gradient(135deg, rgba(100,150,255,0.45) 0%, rgba(215,253,255,0.30) 100%)";
    case "cloudy":
      return "linear-gradient(135deg, rgba(132,140,207,0.40) 0%, rgba(184,188,230,0.25) 100%)";
    case "rainy":
      return "linear-gradient(135deg, rgba(50,120,220,0.45) 0%, rgba(91,196,255,0.30) 100%)";
    case "lightning":
      return "linear-gradient(135deg, rgba(80,90,200,0.50) 0%, rgba(120,130,220,0.35) 100%)";
    case "snowy":
      return "linear-gradient(135deg, rgba(200,210,240,0.40) 0%, rgba(220,230,255,0.25) 100%)";
    default:
      return "linear-gradient(135deg, rgba(132,140,207,0.40) 0%, rgba(184,188,230,0.25) 100%)";
  }
};

const getWeatherIcon = (iconCode: string): string =>
  `/svg/${getWeatherType(iconCode)}.svg`;

const DEFAULT_GRADIENT =
  "linear-gradient(135deg, rgba(132,140,207,0.40) 0%, rgba(184,188,230,0.25) 100%)";

export default function WeatherSmall() {
  const [w, setW] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const u1 = weatherService.subscribe(setW);
    const u2 = weatherService.subscribeHourly(setHourly);
    return () => {
      u1();
      u2();
    };
  }, []);

  const gradient = w ? getWeatherGradient(w.icon ?? "") : DEFAULT_GRADIENT;

  return (
    <WidgetFrame size="small" onClick={() => setExpanded((v) => !v)}>
      <div
        className="relative w-full h-full p-3 flex flex-col text-white"
        style={{ background: gradient }}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs opacity-90 truncate flex-1">{w?.location ?? "—"}</span>
          {w && (
            <span className="text-[9px] text-green-300 flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center my-1 min-h-0">
          {w?.icon && (
            <img
              src={getWeatherIcon(w.icon)}
              alt=""
              className="w-14 h-14 opacity-90 drop-shadow-lg pointer-events-none"
            />
          )}
        </div>
        <div>
          <div className="text-4xl font-light leading-none">
            {w ? `${Math.round(w.temperature)}°` : "--°"}
          </div>
          <div className="text-xs opacity-80 truncate mt-1">{w?.description ?? "—"}</div>
        </div>
        {expanded && hourly.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xl px-2 py-1.5 flex gap-1.5 overflow-x-auto">
            {hourly.slice(0, 5).map((h, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-0.5 text-[9px] text-white/90 shrink-0 min-w-8"
              >
                <span>{i === 0 ? "지금" : h.time}</span>
                {h.icon && (
                  <img src={getWeatherIcon(h.icon)} alt="" className="w-4 h-4" />
                )}
                <span>{Math.round(h.temp)}°</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}
