import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? (
  process.env.NODE_ENV === 'production' 
    ? 'https://accounting-notes-backend.onrender.com' 
    : 'http://localhost:5000'
);

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;