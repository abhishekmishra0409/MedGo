import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from "react-redux";
import store from "./app/Store.js";

const root = createRoot(document.getElementById('root'))

root.render(
    <Provider store={store}>
        <App />
    </Provider>
)

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    navigator.serviceWorker
        .register("/sw.js")
        .catch(() => null);
}

if ("serviceWorker" in navigator && import.meta.env.DEV) {
    navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((registration) => registration.unregister()))
        .catch(() => null);
}

if ("caches" in window && import.meta.env.DEV) {
    caches
        .keys()
        .then((cacheNames) => cacheNames.forEach((cacheName) => caches.delete(cacheName)))
        .catch(() => null);
}
