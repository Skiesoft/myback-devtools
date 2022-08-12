import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";

window.MYBACK_API_TOKEN ??= "DEVELOPMENT_API_TOKEN";
window.MYBACK_API_ENDPOINT ??= "http://localhost:8080/api";

const root = ReactDOM.createRoot(document.getElementById("module-mount-point"));
root.render(<App />);
