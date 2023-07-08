import { Request } from "express";
import { API_KEY } from "../constants";

export default function isApiKeyValid(req: Request) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== API_KEY) {
    return false;
  }
  return true;
}
