const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class CalendarService {
  constructor() {
    this.clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    this.redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3000/auth/callback';

    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    this.cachedEvents = null;
    this.lastFetch = null;
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    this.tokenPath = path.join(__dirname, '../../config/tokens.json');

    this.loadStoredTokens();
  }

  async loadStoredTokens() {
    try {
      const tokenData = await fs.readFile(this.tokenPath, 'utf8');
      const tokens = JSON.parse(tokenData);
      this.oauth2Client.setCredentials(tokens);

      // Set up automatic token refresh
      this.oauth2Client.on('tokens', (tokens) => {
        this.saveTokens(tokens);
      });
    } catch (error) {
      console.log('No stored tokens found, authentication required');
    }
  }

  async saveTokens(tokens) {
    try {
      await fs.mkdir(path.dirname(this.tokenPath), { recursive: true });
      await fs.writeFile(this.tokenPath, JSON.stringify(tokens, null, 2));
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  getAuthUrl() {
    const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async handleAuthCallback(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      await this.saveTokens(tokens);
      return { success: true };
    } catch (error) {
      console.error('Error during OAuth callback:', error);
      return { success: false, error: error.message };
    }
  }

  async isAuthenticated() {
    try {
      const credentials = this.oauth2Client.credentials;
      return !!(credentials && credentials.access_token);
    } catch (error) {
      return false;
    }
  }

  async getTodaysEvents() {
    if (!await this.isAuthenticated()) {
      return {
        authenticated: false,
        authUrl: this.getAuthUrl(),
        today: [],
        tomorrow: []
      };
    }

    if (this.cachedEvents && this.lastFetch &&
        (Date.now() - this.lastFetch) < this.cacheTimeout) {
      return this.cachedEvents;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Get today's events
      const todayEvents = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: today.toISOString(),
        timeMax: tomorrow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 20
      });

      // Get tomorrow's events
      const tomorrowEvents = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: tomorrow.toISOString(),
        timeMax: dayAfterTomorrow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 10
      });

      this.cachedEvents = {
        authenticated: true,
        today: this.formatEvents(todayEvents.data.items || []),
        tomorrow: this.formatEvents(tomorrowEvents.data.items || [])
      };

      this.lastFetch = Date.now();
      return this.cachedEvents;
    } catch (error) {
      console.error('Calendar API error:', error);

      // If authentication error, require re-auth
      if (error.code === 401 || error.code === 403) {
        return {
          authenticated: false,
          authUrl: this.getAuthUrl(),
          today: [],
          tomorrow: []
        };
      }

      // Return cached data if available, or empty on other errors
      return this.cachedEvents || {
        authenticated: true,
        today: [],
        tomorrow: [],
        error: 'Failed to fetch calendar events'
      };
    }
  }

  formatEvents(events) {
    return events.map(event => {
      const start = event.start.dateTime || event.start.date;
      const end = event.end.dateTime || event.end.date;

      let time, duration;

      if (event.start.dateTime) {
        // Timed event
        const startTime = new Date(start);
        const endTime = new Date(end);

        time = startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        const durationMs = endTime - startTime;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          duration = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        } else {
          duration = `${minutes}m`;
        }
      } else {
        // All-day event
        time = 'All day';
        duration = 'All day';
      }

      // Categorize events based on keywords
      let type = 'personal';
      const title = event.summary.toLowerCase();

      if (title.includes('work') || title.includes('meeting') || title.includes('standup') ||
          title.includes('conference') || title.includes('call') || title.includes('project')) {
        type = 'work';
      } else if (title.includes('family') || title.includes('dinner') || title.includes('birthday') ||
                 title.includes('anniversary') || title.includes('visit')) {
        type = 'family';
      }

      return {
        title: event.summary || 'Untitled Event',
        time: time,
        duration: duration,
        type: type,
        location: event.location || null,
        description: event.description || null
      };
    });
  }

  async refreshCache() {
    this.cachedEvents = null;
    this.lastFetch = null;
    return await this.getTodaysEvents();
  }
}

module.exports = CalendarService;