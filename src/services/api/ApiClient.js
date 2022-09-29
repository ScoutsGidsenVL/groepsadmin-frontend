import axios from "axios";
import store from "@/store";


export default function apiClient() {

    let headers = {
        Accept: "application/json",
        responseType: "arraybuffer",
        "Content-Type": "application/json",
    };

    // Publieke pagina mag geen restService aanroepen met token
    if (!window.location.pathname.startsWith("/groepsadmin/frontend/formulier/")) {
        headers.Authorization = "bearer " + store.getters.token;
    }

    const instance = axios.create({
        withCredentials: false,
        headers: headers,
    });

    instance.interceptors.response.use((response) => {
        return response
    }, (error) => {
        console.log(error.response.data.status)
        if (error.response.data.status !== 500) {
            return error
        } else {
            console.log('opgevangen error')
            console.log(error.response.data.status !== 500);
        }
    })
    // return axios.create({
    //   withCredentials: false,
    //   headers: headers,
    // });

    return instance;
}
