import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { showDemoNotification } from "./firebase";
import {Provider} from "react-redux";
import store from "./app/Store.js";

const root = createRoot(document.getElementById('root'))

root.render(
    <Provider store={store}>
        <App />
    </Provider>
)
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
            console.log("Service Worker registered:", registration);
            // showDemoNotification(); // Show the notification
        })
        .catch((error) =>
            console.error("Service Worker registration failed:", error)
        );
}