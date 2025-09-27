require('dotenv').config();
const express = require('express');
const path = require('path');
const cron = require('node-cron');

const WeatherService = require('./services/weather');
const TrafficService = require('./services/traffic');
const CalendarService = require('./services/calendar');

const app = express();
const port = process.env.PORT || 3000;

// Initialize services
const weatherService = new WeatherService();
const trafficService = new TrafficService();
const calendarService = new CalendarService();

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dashboard data cache
let dashboardData = {
  weather: null,
  traffic: null,
  calendar: null,
  lastUpdated: null
};

// Update dashboard data
async function updateDashboardData() {
  try {
    console.log('Updating dashboard data...');

    const [weather, traffic, calendar] = await Promise.allSettled([
      weatherService.getCurrentWeather(),
      trafficService.getTrafficData(),
      calendarService.getTodaysEvents()
    ]);

    dashboardData = {
      weather: weather.status === 'fulfilled' ? weather.value : null,
      traffic: traffic.status === 'fulfilled' ? traffic.value : null,
      calendar: calendar.status === 'fulfilled' ? calendar.value : null,
      lastUpdated: new Date().toLocaleTimeString()
    };

    console.log('Dashboard data updated successfully');
  } catch (error) {
    console.error('Error updating dashboard data:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.render('dashboard', {
    data: dashboardData,
    currentTime: new Date().toLocaleString()
  });
});

app.get('/api/data', (req, res) => {
  res.json(dashboardData);
});

app.get('/api/refresh', async (req, res) => {
  await updateDashboardData();
  res.json({ success: true, data: dashboardData });
});

// Google Calendar OAuth routes
app.get('/auth/google', (req, res) => {
  const authUrl = calendarService.getAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  const result = await calendarService.handleAuthCallback(code);

  if (result.success) {
    // Refresh dashboard data to get calendar events
    await updateDashboardData();
    res.redirect('/?auth=success');
  } else {
    res.status(500).send(`Authentication failed: ${result.error}`);
  }
});

app.get('/auth/status', async (req, res) => {
  const isAuthenticated = await calendarService.isAuthenticated();
  res.json({
    authenticated: isAuthenticated,
    authUrl: isAuthenticated ? null : calendarService.getAuthUrl()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Update data every 10 minutes
cron.schedule('*/10 * * * *', updateDashboardData);

// Initial data load
updateDashboardData();

app.listen(port, () => {
  console.log(`Homepage dashboard running on port ${port}`);
  console.log(`Visit http://localhost:${port} to view your dashboard`);
});

module.exports = app;