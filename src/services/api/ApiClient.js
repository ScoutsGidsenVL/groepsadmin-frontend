import axios from "axios";
import store from "@/store";

export default function apiClient() {
  return axios.create({
    withCredentials: false,
    headers: {
      Accept: "application/json",
      Authorization: "bearer " + store.getters.token,
      responseType: "arraybuffer",
      "Content-Type": "application/json",
    },
  });
}
