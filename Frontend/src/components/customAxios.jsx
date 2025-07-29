import axios from "axios";
import { Navigate } from 'react-router-dom';

export const crudInstance = axios.create({
    baseURL: "http://localhost:4000"
});

crudInstance.interceptors.request.use((config) => {

    const jwt = localStorage.getItem("jwt");

    if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
    console.log(config);
    return config;
}, (err) => {
    console.log(err);
    return Promise.reject(err);
});


crudInstance.interceptors.response.use((response) => {
    return response;
}, (err) => {
    console.log(err);
    if (err.response) {
        console.log(err.response.status);
        if (err.response.status == 401) return <Navigate to="/signUp" />
    }
    return Promise.reject(err);
})