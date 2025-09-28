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
  return await axios.get(`${process.env.REACT_APP_API_URL}/api/Quiz/quizzes`);
};

export const DeleteQuiz = async (id) => {
  return await axios.delete(`${process.env.REACT_APP_API_URL}/api/Quiz/${id}`, {
    headers: { ...authHeaders() },
  });
};


export const CreateQuiz = async (dto) =>
  axios.post(`${process.env.REACT_APP_API_URL}/api/Quiz/create`, dto, {
    headers: { "Content-Type": "application/json", ...authHeaders() }
  });
export const UpdateQuiz = async (id, dto) => axios.put(`${process.env.REACT_APP_API_URL}/api/Quiz/${id}/update`, dto, { headers: { 'Content-Type':'application/json', ...authHeaders() }});

export const GetQuizById = async (id) => {
  return await axios.get(`${process.env.REACT_APP_API_URL}/api/Quiz/${id}`, { headers: { ...authHeaders() }});
};

export const SubmitQuiz = async (id, dto) =>
  axios.post(`${process.env.REACT_APP_API_URL}/api/Quiz/${id}/submit`, dto, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });

export const SearchQuizzes = async ({ categoryId, keyWord, difficulty, page = 1, pageSize = 20 }) =>
  axios.get(`${process.env.REACT_APP_API_URL}/api/Quiz/filter`, {
    params: {
      categoryId: categoryId ?? undefined,
      KeyWord: keyWord || undefined, 
      Difficulty: difficulty ?? undefined,
      page,
      pageSize,
    },
  });