import { useState, useEffect } from 'react';
import { getWeather, get5dayforecast } from './services/weatherService';
import { handleIcon } from './utils/handleIcon';
import searchIcon from './assets/Search.svg';
import weatherappIcon from './assets/Weather-app-icon.svg';
import sunriseIcon from './assets/sunrise.svg';
import windIcon from './assets/wind.svg';
import humidityIcon from './assets/humidity.svg';
import precipitationIcon from './assets/precipitation.svg';

import './index.css';

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [city, setCity] = useState("New York");
  const [fallbackCity, setFallbackCity] = useState("New York");
  const [searchCity, setSearchCity] = useState("");

  // stops page reload, updates city, clears input, triggers weather fetch
  function handleSubmit(e) {
    e.preventDefault();
    if (searchCity.trim() !== "") {
      setCity(searchCity);
      setSearchCity("");
    }
  }
  // capitalizes result/output
  const capitalizeWords = (text) =>
    text.replace(/\b\w/g, l => l.toUpperCase());

   // Produces the 5 day forecast average temp around noon (12pm) 
  function getDailyAverage(forecastList) {
    if (!forecastList) return [];
    const days = {};

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString('en-US');
      const weatherDesc = item.weather[0].description;

      if (!days[dayKey]) {
        days[dayKey] = {
          sum: item.main.temp,
          count: 1,
          min: item.main.temp_min,
          max: item.main.temp_max,
          weather: {}
        };
        days[dayKey].weather[weatherDesc] = 1;
      } else {
        days[dayKey].sum += item.main.temp;
        days[dayKey].count += 1;
        days[dayKey].min = Math.min(days[dayKey].min, item.main.temp_min);
        days[dayKey].max = Math.max(days[dayKey].max, item.main.temp_max);
        days[dayKey].weather[weatherDesc] =
          (days[dayKey].weather[weatherDesc] || 0) + 1;
      }
    });

    return Object.keys(days).slice(0, 5).map(key => {
      const dayData = days[key];
      const mostFreqWeather = Object.keys(dayData.weather).reduce((a, b) =>
        dayData.weather[a] > dayData.weather[b] ? a : b
      );

      return {
        date: key,
        avg: Math.round(dayData.sum / dayData.count),
        min: Math.round(dayData.min),
        max: Math.round(dayData.max),
        weather: mostFreqWeather
      };
    });
  }

  // Fetches current weather
  useEffect(() => {
    getWeather(city)
      .then((data) => {
        if (data.cod === "404") setCity(fallbackCity);
        else {
          setWeatherData(data);
          setFallbackCity(data.name);
        }
      })
      .catch(() => setCity(fallbackCity));
  }, [city, fallbackCity]);

  // Fetches 5-day forecast
  useEffect(() => {
    get5dayforecast(city)
      .then((data) => {
        if (data.cod === "404") {
          get5dayforecast(fallbackCity)
            .then((fallbackData) => setDailyData(getDailyAverage(fallbackData.list)));
        } else setDailyData(getDailyAverage(data.list));
      })
      .catch(() => {
        get5dayforecast(fallbackCity)
          .then((fallbackData) => setDailyData(getDailyAverage(fallbackData.list)));
      });
  }, [city, fallbackCity]);



  // Produces the days of the week for 5-day forecast
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Weather details section for sunrise, wind, humidity, and precipitation
  const sunriseTime = weatherData
    ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : "";

  const windSpeed = weatherData?.wind?.speed ?? 0;

  const humidity = weatherData?.main?.humidity ?? 0;

  const precipitation =
    weatherData?.rain?.["1h"] ||
    weatherData?.snow?.["1h"] ||
    0;

  return (
    // Weather app title and logo

    <div className="app">
      <h1>Weather App</h1>
      <img src={weatherappIcon} alt="Weather app logo" className="weatherapp-icon" />

   {/* Search bar and current weather */}
      {weatherData && (
        <div className="current-weather">

          <form className="search-bar" onSubmit={handleSubmit}>
            <img src={searchIcon} alt="Search city" />
            <input
              type="text"
              placeholder="Search City"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              aria-label="Search for a city"
            />
          </form>

          <div className="current-weather-content">
            <div className="weather-left">
              <h1>{weatherData.name}, {weatherData.sys.country}</h1>
              <p className="date">{todayStr}</p>
            </div>

            <div className="weather-right">
              <img
                src={handleIcon(weatherData.weather[0].description)}
                alt={weatherData.weather[0].description}
                className="weather-icon"
              />
              <div className="weather-info">
                <h2 className="temp">{Math.round(weatherData.main.temp)}°F</h2>
                <p className="description">
                  {capitalizeWords(weatherData.weather[0].description)}
                </p>
              </div>
            </div>
          </div>

        {/* high and low temps */}
          {dailyData.length > 0 && (
            <p className="high-low">
              H: {dailyData[0].max}°F &nbsp; L: {dailyData[0].min}°F
            </p>
          )}

          {/* Weather Details */}
          <h3 className="details-title">Weather Details</h3>

          <div className="weather-details">

            <div className="detail-card" aria-label={`Sunrise at ${sunriseTime}`}>
              <h4>Sunrise</h4>
              <img src={sunriseIcon} alt="Sunrise icon" />
              <p>{sunriseTime}</p>
            </div>

            <div className="detail-card" aria-label={`Wind speed ${windSpeed} miles per hour`}>
              <h4>Wind</h4>
              <img src={windIcon} alt="Wind icon" />
              <p>{windSpeed} mph</p>
            </div>

            <div className="detail-card" aria-label={`Humidity ${humidity} percent`}>
              <h4>Humidity</h4>
              <img src={humidityIcon} alt="Humidity icon" />
              <p>{humidity}%</p>
            </div>

            <div className="detail-card" aria-label={`Precipitation ${precipitation} millimeters`}>
              <h4>Precipitation</h4>
              <img src={precipitationIcon} alt="Precipitation icon" />
              <p>{precipitation} mm</p>
            </div>

          </div>
        </div>
      )}
      {/* 5-day forecast */}
      
      <h3 className="forecast-title">5-Day Forecast</h3>

      <div className="forecast-container">
        {dailyData.map((day, index) => {
          const date = new Date();
          date.setDate(date.getDate() + index);

          const dayName =
            index === 0
              ? "Today"
              : date.toLocaleDateString('en-US', { weekday: 'long' });

          return (
            <div key={index} className="forecast-card">
  <p className="forecast-day">{dayName}</p>

  <img
    src={handleIcon(day.weather)}
    alt={day.weather}
    className="forecast-icon"
  />

  <p className="forecast-temp">{day.avg}°F</p>

  <p className="forecast-description">
    {capitalizeWords(day.weather)}
  </p>
</div>

          );
        })}
      </div>
    </div>
  );
};

export default App;
