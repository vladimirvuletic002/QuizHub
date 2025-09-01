import axios from 'axios';

export const GetUser = async (id) =>
{
    return await axios.get(`${process.env.REACT_APP_API_URL}/api/User/${id}/user`);
}

export const GetUsers = async () =>
{
    return await axios.get(`${process.env.REACT_APP_API_URL}/api/User/users`);
}

/*export const GetProfileImage = async (id) =>
{
    return await axios.get(`${process.env.REACT_APP_API_URL}/api/User/${id}/profile-image`);
}*/

export const GetProfileImage = async(id) =>
{
    const authRaw = localStorage.getItem('auth');
    //const token = authRaw ? JSON.parse(authRaw)?.Token || JSON.parse(authRaw)?.token : null;

    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/User/${id}/profile-image`, {
        responseType: 'blob',
        //headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    // napravi privremeni URL iz bloba
    return URL.createObjectURL(res.data);
}
