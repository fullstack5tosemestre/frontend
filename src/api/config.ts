const raw: string = import.meta.env.VITE_API_URL ?? "http://localhost";
const base = raw.startsWith("http") ? raw : `http://${raw}`;
export const API = `${base}/api/v1`;
