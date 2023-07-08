import { throwErrorResponse } from "code-alchemy";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../constants";

export default function verifyToken(req: Request): any {
  const token = (req.headers["authorization"] as string).replace("Bearer ", "");
  console.log(`token: ${token}`);
  if (!token) {
    throwErrorResponse(403, "No token provided.");
  }

  return jwt.verify(token, SECRET_KEY);
}
