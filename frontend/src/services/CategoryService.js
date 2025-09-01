import axios from "axios";

export const GetAllCategories = async () => {
  return await axios.get(`${process.env.REACT_APP_API_URL}/api/Category`);
};