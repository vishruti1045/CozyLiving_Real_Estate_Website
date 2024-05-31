import otpGenerator from "otp-generator";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma.js"; 
import bcrypt from "bcrypt";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);


app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return res.send({ Status: "User not existed" });
    }

    // Check if an OTP record already exists for the user
    const existingOTP = await prisma.OTP.findFirst({
      where: { userId: user.id },
    });

    let otp;
    if (existingOTP) {
      // Update the existing OTP record
      otp = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      await prisma.OTP.update({
        where: { id: existingOTP.id },
        data: { otp: otp },
      });
    } else {
      // Generate a new OTP
      otp = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      // Store OTP in database or cache
      await prisma.OTP.create({
        data: {
          otp: otp,
          userId: user.id,
        },
      });
    }

    // Send OTP to user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vishrutiparekh2005@gmail.com",
        pass: "pmyb umvu gahq hdnk",
      },
    });

    const mailOptions = {
      from: "vishrutiparekh2005@gmail.com",
      to: email,
      subject: "Reset Password OTP",
      html:` <p>Your OTP for resetting password is: <strong>${otp}</strong></p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.send({ Status: "Error", Message: "Failed to send email" });
      } else {
        return res.send({ Status: "Success", Message: "OTP sent to your email" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ Status: "Error", Message: "Server error" });
  }
});
//const bcrypt = require('bcrypt');
//const prisma = require('@prisma/client').PrismaClient;
//const app = require('express')();

app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  console.log("Received reset password request for email:", email);

  // Verify OTP
  const isValidOtp = await verifyOtp(email, otp);
  console.log("OTP verification result:", isValidOtp);

  if (!isValidOtp) {
    console.log("Invalid OTP, password reset failed");
    return res.send({ Status: "Error", Message: "Invalid OTP" });
  }

  try {
    // Hash the new password
    const hash = await bcrypt.hash(newPassword, 10);
    console.log("New password hashed:", hash);

    // Update user's password in the database
    await prisma.user.update({
      where: { email: email },
      data: { password: hash },
    });
    console.log("Password reset successful");

    // Clear the OTP from the database
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (user) {
      await prisma.OTP.deleteMany({
        where: { userId: user.id },
      });
    }

    return res.send({ Status: "Success", Message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).send({ Status: "Error", Message: "Server error" });
  }
});

async function verifyOtp(email, otp) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return false; // User not found, OTP is invalid
    }

    // Query the OTP record for the user from the database
    const otpRecord = await prisma.OTP.findFirst({
      where: {
        userId: user.id,
        otp: otp,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // OTP is valid for 5 minutes
        },
      },
    });

    if (!otpRecord) {
      return false; // OTP record not found or OTP expired, OTP is invalid
    }

    return true; // OTP is valid
  } catch (error) {
    console.error(error);
    return false; // Error occurred, OTP is invalid
  }
}


app.listen(8800, () => {
  console.log("Server is running!");
});




export default app;