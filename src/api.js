import axios from 'axios';

// In production (Vercel), VITE_API_URL = https://your-backend.onrender.com
// In local dev, it falls back to '' so Vite's proxy handles /api/*
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export default api;
