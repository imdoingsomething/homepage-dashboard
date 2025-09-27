const axios = require('axios');

class TrafficService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.lat = process.env.LOCATION_LAT;
    this.lon = process.env.LOCATION_LON;
    this.cachedData = null;
    this.lastFetch = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getTrafficData() {
    if (this.cachedData && this.lastFetch &&
        (Date.now() - this.lastFetch) < this.cacheTimeout) {
      return this.cachedData;
    }

    try {
      // Get static map with traffic layer
      const staticMapUrl = this.getStaticMapUrl();

      // Get directions to common destinations (you can customize these)
      const destinations = [
        { name: 'Downtown', address: 'downtown' },
        { name: 'Airport', address: 'airport' },
        { name: 'Mall', address: 'shopping mall' }
      ];

      const directionsPromises = destinations.map(dest =>
        this.getDirections(dest)
      );

      const directionsResults = await Promise.allSettled(directionsPromises);

      this.cachedData = {
        mapUrl: staticMapUrl,
        routes: directionsResults.map((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            return {
              destination: destinations[index].name,
              ...result.value
            };
          }
          return {
            destination: destinations[index].name,
            duration: 'N/A',
            distance: 'N/A',
            traffic: 'Unknown'
          };
        }).filter(route => route.duration !== 'N/A')
      };

      this.lastFetch = Date.now();
      return this.cachedData;
    } catch (error) {
      console.error('Traffic API error:', error.message);
      return this.cachedData || {
        mapUrl: this.getStaticMapUrl(),
        routes: []
      };
    }
  }

  getStaticMapUrl() {
    const size = '400x300';
    const zoom = 12;
    const center = `${this.lat},${this.lon}`;

    return `https://maps.googleapis.com/maps/api/staticmap?` +
           `center=${center}&zoom=${zoom}&size=${size}&` +
           `markers=color:red%7C${center}&` +
           `style=feature:road%7Celement:geometry%7Ccolor:0xffffff&` +
           `style=feature:road.highway%7Celement:geometry%7Ccolor:0xe8e8e8&` +
           `key=${this.apiKey}`;
  }

  async getDirections(destination) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: `${this.lat},${this.lon}`,
          destination: destination.address,
          departure_time: 'now',
          traffic_model: 'best_guess',
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];

        return {
          duration: leg.duration_in_traffic ?
                   leg.duration_in_traffic.text :
                   leg.duration.text,
          distance: leg.distance.text,
          traffic: leg.duration_in_traffic && leg.duration_in_traffic.value > leg.duration.value * 1.2 ?
                  'Heavy' : 'Light'
        };
      }
      return null;
    } catch (error) {
      console.error(`Directions error for ${destination.name}:`, error.message);
      return null;
    }
  }
}

module.exports = TrafficService;