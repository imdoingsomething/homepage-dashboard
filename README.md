# Homepage Dashboard

A personal dashboard displaying weather, traffic, and calendar information in a clean, responsive interface.

## Features

- **Weather Data**: Current conditions and 24-hour forecast using OpenWeatherMap API
- **Traffic Information**: Local traffic map and route times via Google Maps API
- **Calendar Integration**: Today's events and tomorrow's preview (mock data included)
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Auto-refresh**: Updates data every 10 minutes automatically
- **Docker Support**: Easy deployment with Docker Compose

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your API keys and location:**
   ```bash
   WEATHER_API_KEY=your_openweather_api_key
   LOCATION_LAT=your_latitude
   LOCATION_LON=your_longitude
   LOCATION_CITY=Your_City
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   PORT=3000
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Visit your dashboard:**
   Open http://localhost:3000 in your browser

## API Keys Setup

### OpenWeatherMap (Weather)
1. Sign up at https://openweathermap.org/api
2. Get your free API key
3. Add to `.env` as `WEATHER_API_KEY`

### Google Maps (Traffic)
1. Go to Google Cloud Console
2. Enable Maps Static API and Directions API
3. Create an API key
4. Add to `.env` as `GOOGLE_MAPS_API_KEY`

### Google Calendar (Optional)
1. Go to Google Cloud Console
2. Enable Calendar API
3. Create OAuth credentials
4. Add client ID and secret to `.env`

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Customization

- Edit destinations in `src/services/traffic.js`
- Modify mock events in `src/services/calendar.js`
- Customize styling in `public/css/style.css`
- Add new widgets by extending the services and updating the dashboard template

## License

MIT