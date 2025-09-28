import axios from "axios";

const API = axios.create({
    // baseURL: "http://10.242.213.8:4000"
    baseURL: "http://localhost:4000"

});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if(token) {
        req.headers.Authorization =  `${token}`;
    }
    console.log('token======>>', token)
    return req;
})

export default API;
