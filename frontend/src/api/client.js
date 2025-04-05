
import axios from 'axios';

const client = axios.create({
  baseURL:"https://trafficapi.khaitu.ca",
  
});
console.log('Axios client baseURL:', client.defaults.baseURL);
export default client;
