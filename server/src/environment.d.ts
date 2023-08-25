declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYPAL_CLIENT_ID: string;
      PAYPAL_CLIENT_SECRET: string;
      PAYPAL_API_URL: string;
      NODE_ENV: 'development' | 'production';
      PORT: string;
    }
  }
}

export { }
