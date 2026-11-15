/**
 * Global API URL Configuration
 * 
 * In Local Development: Points to backend server (http://localhost:5000)
 * In Unified Production (Render / VPS): Relative URL "" (same origin)
 * In Separate Frontend (Vercel): Uses VITE_API_URL environment variable
 */
export const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default API_URL;
