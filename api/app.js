import otpGenerator from "otp-generator";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
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
//app.use('/api/invites', inviteRoute);

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return res.send({ Status: "User not existed" });
    }

    const existingOTP = await prisma.OTP.findFirst({
      where: { userId: user.id },
    });

    let otp;
    if (existingOTP) {
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
      otp = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      await prisma.OTP.create({
        data: {
          otp: otp,
          userId: user.id,
        },
      });
    }

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
      html: `<p>Your OTP for resetting password is: <strong>${otp}</strong></p>`,
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

app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  console.log("Received reset password request for email:", email);

  const isValidOtp = await verifyOtp(email, otp);
  console.log("OTP verification result:", isValidOtp);

  if (!isValidOtp) {
    console.log("Invalid OTP, password reset failed");
    return res.send({ Status: "Error", Message: "Invalid OTP" });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    console.log("New password hashed:", hash);

    await prisma.user.update({
      where: { email: email },
      data: { password: hash },
    });
    console.log("Password reset successful");

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
      return false;
    }

    const otpRecord = await prisma.OTP.findFirst({
      where: {
        userId: user.id,
        otp: otp,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    });

    if (!otpRecord) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

app.post('/send-invite', async (req, res) => {
  const { email, postId } = req.body;
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post || !post.user) {
      console.error("Post or user not found for postId: ${postId}");
      return res.status(404).send({ Status: 'Error', Message: 'Post or User not found' });
    }

    const userEmail = post.user.email;
    const emailTitle = `Request to ${post.type} your ${post.property}`;

    sendEmail(userEmail, emailTitle, 'Please review the request and provide your response at your earliest convenience.');

    console.log("Invite sent to: ${userEmail}");

    res.send({ Status: 'Success', Message: 'Invite sent to post owner' });
  } catch (error) {
    console.error('Error sending invite:', error.message);
    res.status(500).send({ Status: 'Error', Message: 'Server error' });
  }
});

function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vishrutiparekh2005@gmail.com",
      pass: "pmyb umvu gahq hdnk",
    },
  });

  const mailOptions = {
    from: "vishrutiparekh2005@gmail.com",
    to: to,
    subject: subject,
    html: `<p>${text}</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

app.listen(8800, () => {
  console.log("Server is running!");
});

export default app;