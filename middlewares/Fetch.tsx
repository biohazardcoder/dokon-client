import axios from "axios";

let token = "";

if (typeof window !== "undefined") {
  token = localStorage.getItem("token") || "";
}

export const Fetch = axios.create({
  baseURL: "http://server.s-market.uz/",
  headers: {
    Authorization: token,
  },
});
