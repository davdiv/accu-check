import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app")!,
});

export default app;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" });
  });
}
