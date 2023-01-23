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
        if (error.response.status === 500) {
            app.config.globalProperties.$toast.add({
                severity: "error",
                summary: "Ai, er liep iets fout met de Groepsadministratie.",
                detail: "Laat je even aan groepsadministratie@scoutsengidsenvlaanderen.be weten wat je aan het doen was?",
                life: 8000,
            });        }
        return Promise.reject(error);
    })

    return instance;
}
