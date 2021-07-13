import axios from "axios";
import store from "@/store";

export default function apiClientScv() {
  return axios.create({
    withCredentials: false,
    headers: {
      Accept: "text/csv",
      Authorization: "bearer " + store.getters.token,
    },
    responseType: "arrayBuffer",
  });
}
