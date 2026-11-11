import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  // O esbuild nativo do Vite cuida do JSX. Sem o plugin React/Babel, o
  // servidor de desenvolvimento não fica preso no transform dos .jsx.
  esbuild: {
    jsx: "automatic",
  },
  server: {
    host: "127.0.0.1",
    // Estes arquivos só mudam em reinstalações; reiniciar o Vite no meio de
    // uma leitura de package.json pode quebrar o servidor.
    watch: {
      ignored: ["**/vite.config.js", "**/package.json", "**/package-lock.json"],
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
