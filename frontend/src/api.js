const BASE = "http://localhost:8000";

async function request(method, path, body, token, contentType = "application/json") {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (contentType !== "multipart/form-data") {
    headers["Content-Type"] = contentType;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body
      ? contentType === "application/json"
        ? JSON.stringify(body)
        : body
      : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("text/csv")) {
    const blob = await res.blob();
    return blob;
  }
  return res.json();
}

export const api = {
  get: (path, token) => request("GET", path, null, token),
  post: (path, body, token, ct) => request("POST", path, body, token, ct),
  put: (path, body, token) => request("PUT", path, body, token),
  delete: (path, token) => request("DELETE", path, null, token),
};

export function formatElapsed(seconds) {
  if (seconds == null) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function parseTimeInput(str) {
  // Accept H:MM:SS or MM:SS or raw seconds
  const parts = str.trim().split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}
export function parseTimeOfDay(str) {
  // Accept HH:MM:SS or HH:MM
  const parts = str.trim().split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
  return null;
}

export function calcElapsed(startStr, finishStr) {
  const start = parseTimeOfDay(startStr);
  const finish = parseTimeOfDay(finishStr);
  if (start === null || finish === null) return null;
  const elapsed = finish - start;
  return elapsed > 0 ? elapsed : null;
}
