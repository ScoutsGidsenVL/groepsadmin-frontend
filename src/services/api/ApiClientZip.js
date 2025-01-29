import axios from "axios";
import store from "@/store";

export default function apiClientZip() {
  return axios.create({
    withCredentials: false,
    headers: {
      Accept: "application/zip",
      Authorization: "bearer " + store.getters.token,
    },
    responseType: "blob",
  });
}
