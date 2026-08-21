export const env = {

  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || 'DEMO_ANALYTICS_ENABLED',
  isDemoMode: true,
  defaultRefreshIntervalMs: 5000,
}
