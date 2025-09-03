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

export const GetMyAttempts = async () =>
{
    return await axios.get(`${process.env.REACT_APP_API_URL}/api/Attempt/user-attempts`, { headers: { ...authHeaders() }});
}

export const GetDetails = async (id) =>
{
  return await axios.get(`${process.env.REACT_APP_API_URL}/api/Attempt/${id}`, { headers: { ...authHeaders() }})
}