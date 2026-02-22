import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./i18n/config";
import App from "./App.tsx";
import "./index.css";

registerSW({
  onNeedRefresh() {
    if (confirm("A new version of Island First is available. Reload to update?")) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log("Island First is ready to work offline.");
  },
});

createRoot(document.getElementById("root")!).render(<App />);
