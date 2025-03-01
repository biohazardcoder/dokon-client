import axios from "axios";

let token = "";

if (typeof window !== "undefined") {
  token = localStorage.getItem("token") || "";
}

export const Fetch = axios.create({
  baseURL: "http://localhost:4000/",
  headers: {
    Authorization: token,
  },
});
