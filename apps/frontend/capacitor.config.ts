import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.war9a.app",
  appName: "War9a",
  webDir: "public", // fallback only; app loads from server.url
  server: {
    // Dev (Android emulator → host localhost): http://10.0.2.2:3000
    // Dev (physical device on same WiFi):      http://<your-machine-ip>:3000
    // Dev (iOS simulator):                     http://localhost:3000
    // Production:                              https://your-deployed-url.com
    url: "http://10.0.2.2:3000",
    cleartext: true, // allow HTTP in dev; remove for production HTTPS
  },
};

export default config;
