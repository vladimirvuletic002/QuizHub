import axios from "axios";

function authHeaders() {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return {};
    const token = JSON.parse(raw)?.Token || JSON.parse(raw)?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// Rang lista za jedan kviz
export const GetQuizLeaderboard = async (quizId, { page = 1, pageSize = 50 } = {}) => {
  return await axios.get(`${process.env.REACT_APP_API_URL}/api/Leaderboard/quiz/${quizId}`, {
    params: {
      page,
      pageSize,
    },
  });
};

export const GetMyRank = async (quizId) => {
  return await axios.get(
    `${process.env.REACT_APP_API_URL}/api/Leaderboard/quiz/${quizId}/me`,
    { headers: { ...authHeaders() } }
  );
};