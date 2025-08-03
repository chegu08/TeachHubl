import axios from "axios";
import { useNavigate } from 'react-router-dom';

export const crudInstance = axios.create({
    baseURL: "http://localhost:4000"
});

crudInstance.interceptors.request.use((config) => {

    const jwt = localStorage.getItem("jwt");

    if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
    else console.log("jwt not present ",config);
    return config;
}, (err) => {
    console.log("11111")
    console.log(err);
    return Promise.reject(err);
});


crudInstance.interceptors.response.use((response) => {
    return response;
}, (err) => {
    console.log("22222");
    console.log(err);
    if (err.response) {
        console.log(err.response.status);
        if (err.response.status == 401) useNavigate('/signUp');
        else useNavigate('/signIn');
    }
    return Promise.reject({err:{...err,status:err.response?.status}});
})