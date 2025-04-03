import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "../utils/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";



dotenv.config();
const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const user = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    };
  const salt = await bcrypt.genSalt(10);
  //now we set user password to hashed password
  user.password = await bcrypt.hash(user.password, salt);

  const collection = db.collection("users");
  await collection.insertOne(user);

  return res.json({
    message:  "User has been created successfully"
  });
});

authRouter.post("/login", async (req, res) => {
    const user = await db.collection("users").findOne({
        username: req.body.username
    });
    if (!user) {
        return res.status(404).json({
            message: "user not found",
        });
    }
    const isvalidPasswrod = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (!isvalidPasswrod) {
        return res.status(401).json({
            message: "Invalid username or password",
        });
    }

    const token = jwt.sign(
      {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName
      },
      process.env.SECRET_KEY,
      {
          expiresIn: '900000',  // ระยะเวลา 15 นาที
      }
  );
  
  return res.json({
      message: "login successfully",
         "token": "<generated jwt token>",
      token: token,  // ส่งค่าที่สร้างจาก jwt.sign()
  });
  
});

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้

export default authRouter;
