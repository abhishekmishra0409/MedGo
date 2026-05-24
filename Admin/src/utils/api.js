const FALLBACK_API_BASE_URL = "http://localhost:8000/api/";

const normalizeBaseUrl = (value) => {
    const rawValue = value || FALLBACK_API_BASE_URL;
    return rawValue.endsWith("/") ? rawValue : `${rawValue}/`;
};

export const base_url = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const buildApiUrl = (path = "") => {
    const normalizedPath = path.replace(/^\/+/, "");
    return `${base_url}${normalizedPath}`;
};

export const createAuthConfig = (tokenKey = "userToken") => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem(tokenKey) || ""}`,
        Accept: "application/json",
    },
});

export const getErrorMessage = (error, fallbackMessage) => (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
);
