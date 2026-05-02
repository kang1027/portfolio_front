export interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  location: string;
  country: string;
}

export interface ForecastDay {
  date: string;
  icon: string;
  temp: number;
  tempMin: number;
  tempMax: number;
}

export interface HourlyForecast {
  time: string; // HH:MM 형식
  datetime: string; // ISO 형식
  icon: string;
  temp: number;
}

type WeatherCallback = (data: WeatherData | null) => void;
type ForecastCallback = (data: ForecastDay[]) => void;
type HourlyCallback = (data: HourlyForecast[]) => void;

class WeatherService {
  private subscribers: Set<WeatherCallback> = new Set();
  private forecastSubscribers: Set<ForecastCallback> = new Set();
  private hourlySubscribers: Set<HourlyCallback> = new Set();
  private currentWeather: WeatherData | null = null;
  private forecastData: ForecastDay[] = [];
  private hourlyData: HourlyForecast[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private isFetching = false;
  private readonly WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  private readonly WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
  private readonly FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";

  // 기흥구, 경기도 좌표
  private readonly LATITUDE = 37.2742;
  private readonly LONGITUDE = 127.1527;

  constructor() {
    // 구독자가 생기기 전까지는 네트워크 요청을 시작하지 않는다.
  }

  private ensureFetching() {
    if (this.isFetching) return;
    this.isFetching = true;
    this.startFetching();
  }

  private maybeStopFetching() {
    if (
      this.subscribers.size === 0 &&
      this.forecastSubscribers.size === 0 &&
      this.hourlySubscribers.size === 0
    ) {
      this.stopFetching();
    }
  }

  private stopFetching() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isFetching = false;
  }

  private async fetchWeather() {
    try {
      if (!this.WEATHER_API_KEY) {
        console.warn(
          "OpenWeather API key not found. Please add VITE_OPENWEATHER_API_KEY to your .env file"
        );
        // Use mock data for development
        this.currentWeather = this.getMockWeatherData();
        this.notifySubscribers();
        return;
      }

      const url = `${this.WEATHER_API_URL}?lat=${this.LATITUDE}&lon=${this.LONGITUDE}&appid=${this.WEATHER_API_KEY}&units=metric&lang=kr`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      this.currentWeather = {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 10) / 10,
        pressure: data.main.pressure,
        location: "기흥구", // 좌표 기반이므로 지역명 고정
        country: "KR"
      };

      this.notifySubscribers();
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      // Use mock data on error
      this.currentWeather = this.getMockWeatherData();
      this.notifySubscribers();
    }
  }

  private async fetchForecast() {
    try {
      if (!this.WEATHER_API_KEY) {
        // Use mock data for development
        this.forecastData = this.getMockForecastData();
        this.hourlyData = this.getMockHourlyData();
        this.notifyForecastSubscribers();
        this.notifyHourlySubscribers();
        return;
      }

      const url = `${this.FORECAST_API_URL}?lat=${this.LATITUDE}&lon=${this.LONGITUDE}&appid=${this.WEATHER_API_KEY}&units=metric&lang=kr`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();

      // Hourly 데이터 처리 (앞으로 24시간, 3시간 간격 8개)
      this.hourlyData = data.list.slice(0, 8).map((item: any) => ({
        time: item.dt_txt.split(" ")[1].substring(0, 5), // HH:MM
        datetime: item.dt_txt,
        icon: item.weather[0].icon,
        temp: Math.round(item.main.temp)
      }));

      // 5일 예보 데이터 처리 (3시간 단위 40개 -> 하루 단위 5개)
      const dailyData: { [key: string]: any[] } = {};

      data.list.forEach((item: any) => {
        const date = item.dt_txt.split(" ")[0]; // YYYY-MM-DD
        if (!dailyData[date]) {
          dailyData[date] = [];
        }
        dailyData[date].push(item);
      });

      // 각 날짜의 평균/대표 데이터 추출 (6개 가져오기 - 오늘 포함)
      this.forecastData = Object.keys(dailyData)
        .slice(0, 6) // 6일 (오늘 + 5일)
        .map((date) => {
          const dayData = dailyData[date];
          // 정오(12:00) 데이터 우선, 없으면 중간 데이터 사용
          const noonData =
            dayData.find((d) => d.dt_txt.includes("12:00:00")) ||
            dayData[Math.floor(dayData.length / 2)];

          return {
            date,
            icon: noonData.weather[0].icon,
            temp: Math.round(noonData.main.temp),
            tempMin: Math.round(Math.min(...dayData.map((d: any) => d.main.temp_min))),
            tempMax: Math.round(Math.max(...dayData.map((d: any) => d.main.temp_max)))
          };
        });

      this.notifyForecastSubscribers();
      this.notifyHourlySubscribers();
    } catch (error) {
      console.error("Failed to fetch forecast:", error);
      // Use mock data on error
      this.forecastData = this.getMockForecastData();
      this.hourlyData = this.getMockHourlyData();
      this.notifyForecastSubscribers();
      this.notifyHourlySubscribers();
    }
  }

  private getMockWeatherData(): WeatherData {
    return {
      temperature: 15,
      feelsLike: 13,
      description: "맑음",
      icon: "01d",
      humidity: 65,
      windSpeed: 2.5,
      pressure: 1013,
      location: "기흥구",
      country: "KR"
    };
  }

  private getMockForecastData(): ForecastDay[] {
    const icons = ["01d", "02d", "03d", "09d", "01d", "02d"];
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i); // 오늘부터 시작
      return {
        date: date.toISOString().split("T")[0],
        icon: icons[i],
        temp: 15 + Math.floor(Math.random() * 6) - 3,
        tempMin: 10 + Math.floor(Math.random() * 5),
        tempMax: 18 + Math.floor(Math.random() * 5)
      };
    });
  }

  private getMockHourlyData(): HourlyForecast[] {
    const icons = ["01d", "02d", "03d", "09d", "10d", "01d", "02d", "03d"];
    return Array.from({ length: 8 }, (_, i) => {
      const date = new Date();
      date.setHours(date.getHours() + i * 3);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return {
        time: `${hours}:${minutes}`,
        datetime: date.toISOString(),
        icon: icons[i],
        temp: 15 + Math.floor(Math.random() * 6) - 3
      };
    });
  }

  private startFetching() {
    // Fetch immediately
    this.fetchWeather();
    this.fetchForecast();

    // Then fetch every 10 minutes
    this.updateInterval = setInterval(
      () => {
        this.fetchWeather();
        this.fetchForecast();
      },
      10 * 60 * 1000
    );
  }

  subscribe(callback: WeatherCallback): () => void {
    this.subscribers.add(callback);
    this.ensureFetching();

    // Immediately notify with current data
    if (this.currentWeather) {
      callback(this.currentWeather);
    }

    return () => {
      this.subscribers.delete(callback);
      this.maybeStopFetching();
    };
  }

  subscribeForecast(callback: ForecastCallback): () => void {
    this.forecastSubscribers.add(callback);
    this.ensureFetching();

    // Immediately notify with current data
    if (this.forecastData.length > 0) {
      callback(this.forecastData);
    }

    return () => {
      this.forecastSubscribers.delete(callback);
      this.maybeStopFetching();
    };
  }

  subscribeHourly(callback: HourlyCallback): () => void {
    this.hourlySubscribers.add(callback);
    this.ensureFetching();

    // Immediately notify with current data
    if (this.hourlyData.length > 0) {
      callback(this.hourlyData);
    }

    return () => {
      this.hourlySubscribers.delete(callback);
      this.maybeStopFetching();
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => {
      callback(this.currentWeather);
    });
  }

  private notifyForecastSubscribers() {
    this.forecastSubscribers.forEach((callback) => {
      callback(this.forecastData);
    });
  }

  private notifyHourlySubscribers() {
    this.hourlySubscribers.forEach((callback) => {
      callback(this.hourlyData);
    });
  }

  cleanup() {
    this.stopFetching();
    this.subscribers.clear();
    this.forecastSubscribers.clear();
    this.hourlySubscribers.clear();
  }
}

export const weatherService = new WeatherService();
