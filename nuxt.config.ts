// https://nuxt.com/docs/api/configuration/nuxt-confi
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  vite: {
    server: {
      watch: {
        ignored: ['**/db.json']
      }
    }
  }
});
