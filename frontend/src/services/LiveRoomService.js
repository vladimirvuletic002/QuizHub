import axios from "axios";

function authHeader() {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return {};
    const t = JSON.parse(raw)?.token ?? JSON.parse(raw)?.Token;
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch { return {}; }
}

export function CreateLiveRoom({ quizId, roomCode, revealSeconds = 5 }) {
  return axios.post(
    `${process.env.REACT_APP_API_URL}/api/LiveRoom/create`,
    { quizId, roomCode, revealSeconds },
    { headers: { "Content-Type": "application/json", ...authHeader() } }
  );
}