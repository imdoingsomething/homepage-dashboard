# GitHub Secrets Setup Guide

This guide explains how to store your API keys securely as GitHub Secrets for the Homepage Dashboard.

## Setting Up GitHub Secrets

1. **Go to your repository on GitHub:**
   https://github.com/imdoingsomething/homepage-dashboard

2. **Navigate to Settings > Secrets and variables > Actions**

3. **Click "New repository secret" for each of the following:**

### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `WEATHER_API_KEY` | OpenWeatherMap API Key | `abc123def456...` |
| `LOCATION_LAT` | Your latitude | `40.7128` |
| `LOCATION_LON` | Your longitude | `-74.0060` |
| `LOCATION_CITY` | Your city name | `New York` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API Key | `AIza123...` |
| `GOOGLE_CALENDAR_CLIENT_ID` | Google OAuth Client ID | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-abc123...` |
| `GOOGLE_CALENDAR_ID` | Shared calendar ID | `family@group.calendar.google.com` |
| `GOOGLE_CALENDAR_REDIRECT_URI` | OAuth redirect URI | `http://your-pi-ip:3000/auth/callback` |

## Getting API Keys

### 1. OpenWeatherMap (Weather)
- Sign up at https://openweathermap.org/api
- Get your free API key
- Add as `WEATHER_API_KEY`

### 2. Google Maps (Traffic)
- Go to Google Cloud Console
- Enable Maps Static API and Directions API
- Create API key
- Add as `GOOGLE_MAPS_API_KEY`

### 3. Google Calendar (Calendar Events)
- Go to Google Cloud Console
- Enable Google Calendar API
- Create OAuth 2.0 credentials
- Add Client ID as `GOOGLE_CALENDAR_CLIENT_ID`
- Add Client Secret as `GOOGLE_CALENDAR_CLIENT_SECRET`

### 4. Shared Calendar ID
- Open Google Calendar
- Go to your shared calendar settings
- Copy the Calendar ID (looks like `abc123@group.calendar.google.com`)
- Add as `GOOGLE_CALENDAR_ID`

## Deployment with Secrets

Once secrets are set up:

1. **Push code to GitHub** - This triggers the workflow
2. **Docker image builds** with your secrets injected
3. **Download production config** from GitHub Actions artifacts
4. **Deploy on your Pi** using the generated `docker-compose.prod.yml`

## Local Development

For local development, still use the `.env` file:

```bash
cp .env.example .env
# Edit .env with your actual values
```

## Security Benefits

✅ **API keys never stored in code**
✅ **Secrets encrypted by GitHub**
✅ **No accidental commits of sensitive data**
✅ **Easy rotation of credentials**
✅ **Audit trail of secret access**

## Deployment Command

After setting up secrets, deploy with:

```bash
# Download the production config from GitHub Actions
# Then run:
docker-compose -f docker-compose.prod.yml up -d
```