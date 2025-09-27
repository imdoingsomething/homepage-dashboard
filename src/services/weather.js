const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.lat = process.env.LOCATION_LAT;
    this.lon = process.env.LOCATION_LON;
    this.city = process.env.LOCATION_CITY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.cachedData = null;
    this.lastFetch = null;
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  async getCurrentWeather() {
    if (this.cachedData && this.lastFetch &&
        (Date.now() - this.lastFetch) < this.cacheTimeout) {
      return this.cachedData;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: this.lat,
          lon: this.lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const forecastResponse = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: this.lat,
          lon: this.lon,
          appid: this.apiKey,
          units: 'metric',
          cnt: 8 // next 24 hours (3-hour intervals)
        }
      });

      this.cachedData = {
        current: {
          temperature: Math.round(response.data.main.temp),
          description: response.data.weather[0].description,
          icon: response.data.weather[0].icon,
          humidity: response.data.main.humidity,
          windSpeed: response.data.wind.speed,
          city: response.data.name
        },
        forecast: forecastResponse.data.list.map(item => ({
          time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
          }),
          temperature: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          description: item.weather[0].description
        }))
      };

      this.lastFetch = Date.now();
      return this.cachedData;
    } catch (error) {
      console.error('Weather API error:', error.message);
      return this.cachedData || {
        current: {
          temperature: '--',
          description: 'Weather data unavailable',
          icon: '01d',
          humidity: '--',
          windSpeed: '--',
          city: this.city || 'Unknown'
        },
        forecast: []
      };
    }
  }
}

module.exports = WeatherService;