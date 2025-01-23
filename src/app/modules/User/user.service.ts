import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { emailTemplate } from "../../../helpars/emailtempForOTP";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import { generateToken } from "../../../utils/generateToken";
import { generateTokenReset } from "../../../utils/generateTokenForReset";
import sentEmailUtility from "../../../utils/sentEmailUtility";

interface UserWithOptionalPassword extends Omit<User, "password"> {
  password?: string;
}

const registerUserIntoDB = async (payload: any) => {
  const hashedPassword: string = await bcrypt.hash(payload.password, 12);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User already exists with this email"
    );
  }

  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  const emailSubject = "OTP Verification for Registration";

  // Plain text version
  const emailText = `Your OTP is: ${otp}`;

  const textForRegistration = `Thank you for registering with Afcomz. To complete your registration, please verify your email address by entering the verification code below.`;

  // HTML content for the email design
  const emailHTML = emailTemplate(otp, textForRegistration);

  // Send email with both plain text and HTML
  await sentEmailUtility(payload.email, emailSubject, emailText, emailHTML);

  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

  await prisma.otp.create({
    data: {
      email: payload.email,
      otp,
      expiry: otpExpiry,
    },
  });

  return {
    email: user.email,
    role: user.role,
    status: user.status,
  };
};

const verifyOtp = async (payload: {
  fcpmToken?: string;
  email: string;
  otp: number; // take string as number
}) => {
  // Check if the user exists
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  // Check if the OTP is valid
  const otpData = await prisma.otp.findFirst({
    where: {
      email: payload.email,
    },
  });

  if (otpData?.otp !== payload.otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (otpData?.expiry < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has expired");
  }

  if (userData.status !== "ACTIVE") {
    await prisma.user.update({
      where: {
        id: userData.id,
      },
      data: {
        status: "ACTIVE",
        isOnline: true,
      },
    });
  }

  // Remove the OTP after successful verification
  await prisma.otp.delete({
    where: {
      id: otpData.id,
    },
  });

  // Update the FCM token if provided
  if (payload?.fcpmToken) {
    await prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        fcmToken: payload.fcpmToken,
      },
    });
  }

  const accessToken = generateToken(
    {
      id: userData.id,
      email: userData.email as string,
      role: userData.role,
      fcmToken: payload.fcpmToken,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    message: "OTP verified successfully",
    accessToken,
  };
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      country: true,
      city: true,
      phoneNumber: true,
      email: true,
      isOnline: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const getMyProfileFromDB = async (id: string) => {
  const Profile = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      country: true,
      city: true,
      phoneNumber: true,
      email: true,
      isOnline: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Profile;
};

const getUserDetailsFromDB = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      country: true,
      city: true,
      phoneNumber: true,
      email: true,
      isOnline: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

const updateMyProfileIntoDB = async (id: string, payload: any, file: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  const profileImage = file?.originalname
    ? `${process.env.BACKEND_IMAGE_URL}/uploads/${file.originalname}`
    : existingUser.profileImage;

  const updatedData = {
    ...payload,
    profileImage,
  };

  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: updatedData,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      country: true,
      city: true,
      phoneNumber: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  const result = await prisma.user.delete({
    where: {
      id: id,
    },
  });
  return;
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: { email: payload.email, status: "ACTIVE" },
  });

  if (!userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  const emailSubject = "OTP Verification for Password Reset";

  // Plain text version
  const emailText = `Your OTP is: ${otp}`;

  const textForResetPassword = `We have received a request to reset your password. Please enter the verification code to reset your password.`;

  // HTML content for the email design
  const emailHTML = emailTemplate(otp, textForResetPassword);

  // Send email with both plain text and HTML
  await sentEmailUtility(payload.email, emailSubject, emailText, emailHTML);

  // Set OTP expiry date (e.g., 10 minutes from now)
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

  // Check if OTP already exists for the user
  const existingOtp = await prisma.otp.findFirst({
    where: { email: payload.email },
  });

  if (existingOtp) {
    await prisma.otp.update({
      where: {
        id: existingOtp.id,
      },
      data: {
        otp,
        expiry: otpExpiry,
      },
    });
  } else {
    await prisma.otp.create({
      data: {
        email: payload.email,
        otp,
        expiry: otpExpiry,
      },
    });
  }
};

const verifyResetOtp = async (payload: { email: string; otp: number }) => {
  // Check if the user exists
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  const otpData = await prisma.otp.findFirst({
    where: {
      email: payload.email,
    },
  });

  if (otpData?.otp !== payload.otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (otpData?.expiry < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has expired");
  }

  await prisma.otp.delete({
    where: {
      id: otpData.id,
    },
  });

  // Generate an access token
  const accessToken = generateTokenReset(
    {
      email: userData.email,
      status: userData.status,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    message: "OTP verified successfully",
    accessToken,
  };
};

const resetPassword = async (
  accessToken: string,
  payload: { password: string }
) => {
  if (!accessToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
  }

  const decodedToken = jwtHelpers.verifyToken(
    accessToken,
    config.jwt.jwt_secret as Secret
  );

  const email = decodedToken?.email;

  if (!email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
  }

  const userData = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 12);

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      password: hashedPassword,
    },
  });

  return;
};

const changePassword = async (userId: string, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
      status: "ACTIVE",
    },
  });

  const isPasswordCorrect = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid old password");
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return;
};

export const UserServices = {
  registerUserIntoDB,
  getAllUsersFromDB,
  getMyProfileFromDB,
  getUserDetailsFromDB,
  updateMyProfileIntoDB,
  deleteUser,
  forgotPassword,
  resetPassword,
  verifyResetOtp,
  verifyOtp,
  changePassword,
};
