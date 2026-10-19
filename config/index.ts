/**
 * Application configuration for Bright Spark.
 */

export const APP_CONFIG = {
  appName: 'Bright Spark',
  appVersion: '1.0.0-phase1',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1',
  isDev: process.env.NODE_ENV !== 'production',
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
};
