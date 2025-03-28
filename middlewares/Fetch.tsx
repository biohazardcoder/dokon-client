import axios from "axios";

let token = "";

if (typeof window !== "undefined") {
  token = localStorage.getItem("token") || "";
}

export const Fetch = axios.create({
  baseURL: "https://srv.s-market.uz/",
  headers: {
    Authorization: token,
  },
});
