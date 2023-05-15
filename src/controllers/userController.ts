import { Request, RequestHandler, Response } from "express";
import mssql from "mssql";
import { sqlConfig } from "../config";
import { v4 as uid } from "uuid";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";
import { userRegistrationSchema } from "../Helpers/userValidation";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface ExtendedRequest extends Request {
  body: {
    name: string;
    email: String;
    password: string;
  };
  params: {
    id: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export const addUser = async (req: ExtendedRequest, res: Response) => {
  try {
    let id = uid();
    const { name, email, password } = req.body;

    const { error } = userRegistrationSchema.validate(req.body);

    if (error) {
      return res.status(404).json(error);
    }

    let hashedPassword = await bcrypt.hash(password, 10);
    const pool = await mssql.connect(sqlConfig);
    await pool
      .request()
      .input("id", mssql.VarChar, id)
      .input("name", mssql.VarChar, name)
      .input("email", mssql.VarChar, email)
      .input("password", mssql.VarChar, hashedPassword)
      .execute("insertUser");

    return res.status(201).json({ message: "user registered!!" });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const getallUser = async (req: Request, res: Response) => {
  try {
    const pool = await mssql.connect(sqlConfig);
    let users: User[] = (await (await pool.request()).execute("getUsers"))
      .recordset;
    res.status(200).json(users);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const getUserByEmail: RequestHandler<{ email: string }> = async (
  req,
  res
) => {
  try {
    const { email } = req.params;

    const pool = await mssql.connect(sqlConfig);

    let user: User[] = (
      await (await pool.request())
        .input("email", email)
        .execute("getUserByEmail")
    ).recordset;
    res.json(user);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const pool = await mssql.connect(sqlConfig);
    const { email, password } = req.body;
    let user: User[] = (
      await (await pool.request())
        .input("email", email)
        .execute("getUserByEmail")
    ).recordset;
    if (!user[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    let valiUser = await bcrypt.compare(password, user[0].password);
    if (!valiUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const payload = user.map((user1) => {
      const { password, ...rest } = user1;
      return rest;
    });

    const token = jwt.sign(payload[0], process.env.SECRET_KEY as string, {
      expiresIn: "360000s",
    });

    return res.json({ message: "Log in successfull", token });
  } catch (error: any) {
    return res.status(404).json(error.message);
  }
};

export const getUserByName: RequestHandler<{ name: string }> = async (
  req,
  res
) => {
  try {
    const { name } = req.params;

    const pool = await mssql.connect(sqlConfig);

    let user: User[] = (
      await (await pool.request()).input("name", name).execute("getUserByName")
    ).recordset;
    res.json(user);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const resertPassword = async (req: Request, res: Response) => {
  try {
    const pool = await mssql.connect(sqlConfig);
    const { email, newPassword } = req.body;
    let user: User[] = (
      await (await pool.request())
        .input("email", email)
        .execute("getUserByEmail")
    ).recordset;
    user.find((user) => user.email === email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
