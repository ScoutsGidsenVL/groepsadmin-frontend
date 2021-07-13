import axios from "axios";
import store from "@/store";

export default function apiClientMail() {
  return axios.create({
    withCredentials: false,
    headers: {
      Accept: "application/json",
      Authorization: "bearer " + store.getters.token,
      "Content-Type": undefined,
    },
  });
}
