import { Router } from "express";
import {
  addUser,
  getUserByEmail,
  getUserByName,
  getallUser,
  loginUser,
} from "../controllers/userController";
import { verifyToken } from "../middlewares/verifyToken";

export const userRoutes = Router();

userRoutes.post("", addUser);
userRoutes.get("", getallUser);
userRoutes.get("/name/:name", verifyToken, getUserByName);
userRoutes.post("/login", loginUser);
userRoutes.get("/email/:email", verifyToken, getUserByEmail);
