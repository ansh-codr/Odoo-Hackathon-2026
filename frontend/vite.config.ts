import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3000, // You can change this to your preferred port
    // host: true, // Uncomment this if you need to expose it on your local network
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" }
    }),
    tsconfigPaths(),
  ],
});

