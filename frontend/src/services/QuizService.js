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

export const GetAllQuizzes = async () => {
  return await axios.get(`${process.env.REACT_APP_API_URL}/api/Quiz/get-all-quizzes`, {
    headers: { ...authHeaders() }
  });
};

export const DeleteQuiz = async (id) => {
  return await axios.delete(`${process.env.REACT_APP_API_URL}/api/Quiz/delete/${id}`, {
    headers: { ...authHeaders() },
  });
};


export const CreateQuiz = async (dto) =>
  axios.post(`${process.env.REACT_APP_API_URL}/api/Quiz/create`, dto, {
    headers: { "Content-Type": "application/json", ...authHeaders() }
  });
export const UpdateQuiz = async (id, dto) => axios.put(`${process.env.REACT_APP_API_URL}/api/Quiz/update/${id}`, dto, { headers: { 'Content-Type':'application/json', ...authHeaders() }});
// export const GetQuizById = async (id) => axios.get(`${API}/api/Quizzes/${id}`, { headers: { ...authHeaders() }});
