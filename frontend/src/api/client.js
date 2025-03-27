
import axios from 'axios';

const client = axios.create({
  baseURL:"https://api.khaitu.ca",
  
});
console.log('Axios client baseURL:', client.defaults.baseURL);
export default client;
