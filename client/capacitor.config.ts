import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.biz.qwertybot',
  appName: 'qwertybot',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Mimic standard Chrome Mobile user agent to allow Google Sign-In in Android WebView
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
