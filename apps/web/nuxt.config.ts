export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  modules: ["@nuxtjs/tailwindcss", "@vite-pwa/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "http://localhost:8787",
      wsUrl: process.env.NUXT_PUBLIC_WS_URL ?? "ws://localhost:8787/ws",
      devDeviceId: process.env.NUXT_PUBLIC_DEV_DEVICE_ID ?? "pc_local_demo",
      devAgentToken: process.env.NUXT_PUBLIC_DEV_AGENT_TOKEN ?? "local-demo-agent-token",
      devMobileToken: process.env.NUXT_PUBLIC_DEV_MOBILE_TOKEN ?? "local-demo-mobile-token"
    }
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "MobilePC Agent",
      short_name: "MobilePC",
      theme_color: "#101820",
      background_color: "#f7f8f3",
      display: "standalone",
      start_url: "/"
    }
  }
});
