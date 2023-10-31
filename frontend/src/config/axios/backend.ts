import { env } from "@/config/env.mjs";
import axios from "axios";

export const backendAxios = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_BASE_URL,
});
