
import axios from 'axios';

const client = axios.create({
  baseURL:"https://trafficapi.khaitu.ca",
  
});
//console.log('Axios client baseURL:', client.defaults.baseURL);
// Fetch total predictions count
export const getTotalPredictions = () =>
  client.get("/api/stats/total").then(res => res.data);

// Fetch the number of predictions over time (for chart)
export const getTimeseries = () =>
  client.get("/api/stats/timeseries").then(res => res.data);

// Fetch top 5 most common start/end locations
export const getFrequentLocations = () =>
  client.get("/api/stats/frequent").then(res => res.data);

// Fetch the 5 most recent prediction events
export const getRecentActivity = () =>
  client.get("/api/stats/recent").then(res => res.data);

export default client;
