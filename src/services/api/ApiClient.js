import axios from "axios";
import store from "@/store";

export default function apiClient() {

  let headers = {
    Accept: "application/json",
    responseType: "arraybuffer",
    "Content-Type": "application/json",
  };

  // Publieke pagina mag geen restService aanroepen met token
  if(!window.location.pathname.startsWith("/groepsadmin/frontend/formulier/")) {
    headers.Authorization = "bearer " + store.getters.token;
  }

  return axios.create({
    withCredentials: false,
    headers: headers
  });
}
