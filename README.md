# Homepage Dashboard

A personal dashboard displaying weather, traffic, and calendar information in a clean, responsive interface. Built with Node.js and designed for easy deployment on Raspberry Pi or any Docker-compatible system.

## Features

- **Weather Data**: Current conditions and 24-hour forecast using OpenWeatherMap API
- **Traffic Information**: Local traffic map and route times via Google Maps API
- **Calendar Integration**: Google Calendar OAuth integration with today's and tomorrow's events
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Auto-refresh**: Updates data automatically with intelligent caching
- **Docker Support**: Easy deployment with Docker Compose
- **GitHub Actions**: Automated builds and secure secrets management
- **Production Ready**: Includes security best practices and environment configuration

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

### Google Calendar
1. Go to Google Cloud Console
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Add client ID, secret, calendar ID, and redirect URI to `.env`

## Production Deployment

### Using GitHub Secrets (Recommended)

For secure production deployment, use GitHub Secrets instead of local `.env` files:

1. **Set up GitHub Secrets** (see `SECRETS_SETUP.md` for detailed guide)
2. **Push to GitHub** - This triggers automated Docker build
3. **Download production config** from GitHub Actions artifacts
4. **Deploy on your server:**
   ```bash
   # Download docker-compose.prod.yml from GitHub Actions
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Production Deployment

```bash
# Build production image
docker build -t homepage-dashboard .

# Run with production environment
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e WEATHER_API_KEY=your_key \
  -e LOCATION_LAT=your_lat \
  -e LOCATION_LON=your_lon \
  -e LOCATION_CITY=your_city \
  -e GOOGLE_MAPS_API_KEY=your_key \
  -e GOOGLE_CALENDAR_CLIENT_ID=your_id \
  -e GOOGLE_CALENDAR_CLIENT_SECRET=your_secret \
  -e GOOGLE_CALENDAR_ID=your_calendar_id \
  -e GOOGLE_CALENDAR_REDIRECT_URI=http://your-ip:3000/auth/callback \
  homepage-dashboard
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Project Structure

```
├── src/
│   ├── services/          # API service modules
│   │   ├── weather.js     # OpenWeatherMap integration
│   │   ├── traffic.js     # Google Maps integration
│   │   └── calendar.js    # Google Calendar OAuth
│   └── server.js          # Express server
├── public/                # Static assets
├── config/                # Runtime configuration
├── .github/workflows/     # GitHub Actions
├── SECRETS_SETUP.md       # Production secrets guide
└── docker-compose.yml     # Local development
```

## Customization

- Edit destinations in `src/services/traffic.js`
- Modify calendar settings in `src/services/calendar.js`
- Customize styling in `public/css/style.css`
- Add new widgets by creating services and updating the dashboard template
- Extend secrets setup in `SECRETS_SETUP.md` for new APIs

## Security Features

- Environment variables for all sensitive data
- GitHub Secrets integration for production
- No hardcoded API keys or credentials
- OAuth 2.0 for Google Calendar integration
- Docker multi-stage builds for minimal attack surface

## Troubleshooting

### Calendar Authentication
Visit `http://your-ip:3000/auth` to authenticate with Google Calendar.

### API Rate Limits
All services include caching to respect API rate limits:
- Weather: 10-minute cache
- Traffic: 5-minute cache
- Calendar: 15-minute cache

### Docker Issues
```bash
# Rebuild without cache
docker-compose build --no-cache

# View logs
docker-compose logs -f
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `docker-compose up`
5. Update `SECRETS_SETUP.md` if adding new APIs
6. Submit a pull request

## License

MIT