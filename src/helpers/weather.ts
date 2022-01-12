import fetch from "cross-fetch";
import { format } from "fecha";
import { readFile, readFileSync, writeFileSync } from "fs";

export interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

export interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface Clouds {
  all: number;
}

export interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

export interface Snow {
  "3h": number;
}

export interface Sys {
  pod: string;
}

export interface List {
  dt: number;
  main: Main;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  snow: Snow;
  sys: Sys;
  dt_txt: string;
}

export interface Coord {
  lat: number;
  lon: number;
}

export interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: List[];
  city: City;
}

const ICONS = new Map([
  ["01d", "☀️"],
  ["02d", "⛅"],
  ["03d", "🌥️"],
  ["04d", "☁️"],
  ["09d", "🌧️"],
  ["10d", "🌦️"],
  ["11d", "⛈️"],
  ["13d", "❄️"],
  ["50d", "🌫️"],

  ["01n", "🌛"],
  ["02n", "⛅"],
  ["03n", "🌥️"],
  ["04n", "☁️"],
  ["09n", "🌧️"],
  ["10n", "🌦️"],
  ["11n", "⛈️"],
  ["13n", "❄️"],
  ["50n", "🌫️"],
]);

let weatherData: WeatherData | undefined = undefined;

const URL = `https://api.openweathermap.org/data/2.5/forecast?q=Lappeenranta&appid=${process.env.WEATHER_API_KEY}`;
export async function fetchWeather() {
  console.warn("Fetching");
  const res = await fetch(URL);
  const data: WeatherData = await res.json();
  weatherData = data;
  await saveWeatherData();
  return data;
}

async function saveWeatherData() {
  writeFileSync(
    `${__dirname}/weather/lappeenranta.json`,
    JSON.stringify(weatherData)
  );
}

async function readWeatherData() {
  return new Promise<WeatherData>((resolve) => {
    readFile(
      `${__dirname}/weather/lappeenranta.json`,
      "utf8",
      (err, jsonString) => {
        if (err) {
          console.log("File read failed:", err);
          return;
        }
        const data = JSON.parse(jsonString) as WeatherData;
        resolve(data);
      }
    );
  });
}

async function getWeatherData() {
  // Try to read from file first
  if (!weatherData) weatherData = await readWeatherData();
  // Then try to fetch if needed
  if (!weatherData) weatherData = await fetchWeather();

  return weatherData;
}

export async function getWeatherString(time: Date) {
  const weatherData = await getWeatherData();

  if (time.getTime() < new Date().getTime()) return "";

  for (const result of weatherData.list) {
    // const date = new Date(result.dt * 1000);
    // const timeStr = format(date, "DD.MM.YYYY HH:mm");
    // console.log(timeStr);
    if (result.dt > time.getTime() / 1000) {
      //   console.log(toCelsius(result.main.temp), "C");
      //   console.log(result);
      //   console.log(result.weather);
      //   console.log(result.dt);
      //   console.log(time.getTime() / 1000);

      //   const date = new Date(result.dt * 1000);
      //   const timeStr = format(date, "DD.MM.YYYY HH:mm");

      const temp = toCelsius(result.main.temp);
      const icon = ICONS.get(result.weather?.[0].icon ?? "") ?? "";
      return `${icon} ${Math.round(temp)}°C`;
    }
  }
  return "";
}

const toCelsius = (kelvin: number) => kelvin - 273.15;
