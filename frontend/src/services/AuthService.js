import axios from 'axios';

export const Register = async(formData)=>
{
    return await axios.post(`${process.env.REACT_APP_API_URL}/api/Auth/register`, formData);
}

export const Login = async()=>
{
    return await axios.post(`${process.env.REACT_APP_API_URL}/api/Auth/login`,);
}