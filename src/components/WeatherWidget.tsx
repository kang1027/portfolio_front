import { useEffect, useState } from "react";
import {
  weatherService,
  type WeatherData,
  type ForecastDay,
  type HourlyForecast
} from "~/services/weatherService";

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHourly, setShowHourly] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribe = weatherService.subscribe((data) => {
      setWeather(data);
      setIsLoading(false);
    });

    const unsubscribeForecast = weatherService.subscribeForecast((data) => {
      setForecast(data);
    });

    const unsubscribeHourly = weatherService.subscribeHourly((data) => {
      setHourly(data);
    });

    return () => {
      unsubscribe();
      unsubscribeForecast();
      unsubscribeHourly();
    };
  }, []);

  // 날씨 타입 결정 (OpenWeather icon code 기반)
  const getWeatherType = (iconCode: string): string => {
    if (iconCode.startsWith("01")) return "sunny"; // clear sky
    if (iconCode.startsWith("02")) return "partly_cloudy"; // few clouds
    if (iconCode.startsWith("03") || iconCode.startsWith("04")) return "cloudy"; // clouds
    if (iconCode.startsWith("09") || iconCode.startsWith("10")) return "rainy"; // rain
    if (iconCode.startsWith("11")) return "lightning"; // thunderstorm
    if (iconCode.startsWith("13")) return "snowy"; // snow
    return "cloudy";
  };

  // SVG 아이콘 경로
  const getWeatherIcon = (iconCode: string): string => {
    const weatherType = getWeatherType(iconCode);
    return `/svg/${weatherType}.svg`;
  };

  // 날씨별 배경 그라데이션 (Liquid Glass 스타일)
  const getWeatherGradient = (iconCode: string): string => {
    const weatherType = getWeatherType(iconCode);

    switch (weatherType) {
      case "sunny":
        return "linear-gradient(135deg, rgba(255, 200, 100, 0.3) 0%, rgba(253, 245, 150, 0.2) 100%)";
      case "cloudy":
        return "linear-gradient(135deg, rgba(132, 140, 207, 0.25) 0%, rgba(184, 188, 230, 0.15) 100%)";
      case "partly_cloudy":
        return "linear-gradient(135deg, rgba(100, 150, 255, 0.3) 0%, rgba(215, 253, 255, 0.2) 100%)";
      case "rainy":
        return "linear-gradient(135deg, rgba(50, 120, 220, 0.3) 0%, rgba(91, 196, 255, 0.2) 100%)";
      case "lightning":
        return "linear-gradient(135deg, rgba(80, 90, 200, 0.35) 0%, rgba(120, 130, 220, 0.25) 100%)";
      case "snowy":
        return "linear-gradient(135deg, rgba(200, 210, 240, 0.25) 0%, rgba(220, 230, 255, 0.15) 100%)";
      default:
        return "linear-gradient(135deg, rgba(132, 140, 207, 0.25) 0%, rgba(184, 188, 230, 0.15) 100%)";
    }
  };

  // 날씨 상태 한글 매핑
  const getWeatherLabel = (iconCode: string): string => {
    const weatherType = getWeatherType(iconCode);
    const labels: Record<string, string> = {
      sunny: "Sunny",
      cloudy: "Cloudy",
      partly_cloudy: "Partly Cloudy",
      rainy: "Rainy",
      lightning: "Thunderstorm",
      snowy: "Snowy"
    };
    return labels[weatherType] || "Cloudy";
  };

  // 섭씨 -> 화씨 변환
  const celsiusToFahrenheit = (celsius: number): number => {
    return Math.round((celsius * 9) / 5 + 32);
  };

  // 현재 날짜 가져오기 (YYYY/MM/DD 형식)
  const getCurrentDate = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // 요일 가져오기
  const getCurrentDay = (): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    return days[new Date().getDay()];
  };

  // 날짜 문자열(YYYY-MM-DD)에서 요일 가져오기
  const getDayFromDate = (dateStr: string): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  if (isLoading || !weather) {
    return (
      <div className="fixed top-[350px] left-[332px] z-[5]">
        <div
          className="relative w-[280px] h-[240px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-3xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(132, 140, 207, 0.25) 0%, rgba(184, 188, 230, 0.15) 100%)"
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.2) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)"
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-sm font-['Inter'] font-medium">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-[350px] left-[332px] z-[5]">
      <div
        className="relative w-[280px] h-[240px] rounded-3xl shadow-2xl border border-white/20 backdrop-blur-3xl"
        style={{
          background: getWeatherGradient(weather.icon),
          overflow: "visible" // 팝업이 보이도록 변경
        }}
      >
        {/* Glass Overlay */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.2) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)"
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Powered by OpenWeather */}
          <div className="absolute top-2 left-3 z-10">
            <div className="font-['Inter'] font-medium text-[9px] text-white/50">
              Powered by OpenWeather
            </div>
          </div>

          {/* Top 2/3: Current Weather */}
          <div
            className="flex items-center px-6 h-[160px] relative"
            onMouseEnter={() => setShowHourly(true)}
            onMouseMove={(e) => {
              // 위젯 컨테이너 기준 상대 좌표
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }}
            onMouseLeave={() => setShowHourly(false)}
          >
            {/* Left: Weather Icon */}
            <div className="flex items-center justify-center w-20 h-20 flex-shrink-0">
              <img
                src={getWeatherIcon(weather.icon)}
                alt={getWeatherLabel(weather.icon)}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            {/* Vertical Divider Line */}
            <div className="h-24 border-l-2 border-white/40 mx-5"></div>

            {/* Right: Info */}
            <div className="flex flex-col justify-center gap-2 flex-1">
              {/* Location */}
              <div className="font-['Inter'] font-bold text-base leading-tight text-white">
                {weather.location}
              </div>

              {/* Temperature */}
              <div className="flex items-baseline gap-1.5">
                <div
                  className="font-['Inter'] font-bold text-4xl leading-none text-white"
                  style={{
                    mixBlendMode: "overlay"
                  }}
                >
                  {weather.temperature}°
                </div>
                <div
                  className="font-['Inter'] font-medium text-sm text-white/70"
                  style={{
                    mixBlendMode: "overlay"
                  }}
                >
                  {celsiusToFahrenheit(weather.temperature)}°F
                </div>
              </div>

              {/* Date */}
              <div className="font-['Inter'] font-medium text-xs text-white/70">
                {getCurrentDate()}
              </div>

              {/* Day */}
              <div className="font-['Inter'] font-medium text-xs text-white/70">
                {getCurrentDay()}
              </div>
            </div>

            {/* Hourly Forecast Popup */}
            {showHourly && (
              <div
                className="absolute"
                style={{
                  minWidth: "400px",
                  zIndex: 9999,
                  left: `${mousePos.x}px`,
                  top: `${mousePos.y - 120}px`, // 마우스 위 120px
                  transform: "translateX(-50%)", // 가운데 정렬
                  pointerEvents: "none" // 팝업이 마우스 이벤트를 방해하지 않도록
                }}
              >
                <div
                  className="rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(40, 40, 50, 0.95) 0%, rgba(30, 30, 40, 0.9) 100%)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)"
                  }}
                >
                  <div className="px-4 py-3">
                    <div className="font-['Inter'] font-bold text-sm text-white/90 mb-3">
                      Hourly Forecast
                    </div>
                    {hourly.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {hourly.map((item, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-1 min-w-[50px]"
                          >
                            {/* Time */}
                            <div className="font-['Inter'] font-medium text-[10px] text-white/70">
                              {item.time}
                            </div>
                            {/* Icon */}
                            <div className="w-8 h-8">
                              <img
                                src={getWeatherIcon(item.icon)}
                                alt={item.time}
                                className="w-full h-full object-contain drop-shadow-md"
                              />
                            </div>
                            {/* Temperature */}
                            <div className="font-['Inter'] font-bold text-xs text-white">
                              {item.temp}°
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-white/70 text-xs">Loading hourly data...</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Horizontal Divider */}
          <div className="w-full border-t border-white/30"></div>

          {/* Bottom 1/3: 5-Day Forecast (내일부터 5일) */}
          <div className="flex items-center justify-around px-3 h-[80px]">
            {forecast.slice(1, 6).map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                {/* Day */}
                <div className="font-['Inter'] font-medium text-[10px] text-white/60">
                  {getDayFromDate(item.date)}
                </div>
                {/* Icon */}
                <div className="w-7 h-7">
                  <img
                    src={getWeatherIcon(item.icon)}
                    alt={getDayFromDate(item.date)}
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                </div>
                {/* Temperature */}
                <div
                  className="font-['Inter'] font-bold text-xs text-white"
                  style={{
                    mixBlendMode: "overlay"
                  }}
                >
                  {item.temp}°
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
