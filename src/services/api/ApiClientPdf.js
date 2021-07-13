import axios from "axios";
import store from "@/store";

export default function apiClientPdf() {
  return axios.create({
    withCredentials: false,
    headers: {
      Accept: "application/pdf",
      Authorization: "bearer " + store.getters.token,
    },
    responseType: "blob",
  });
}
