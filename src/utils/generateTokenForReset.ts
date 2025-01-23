import jwt, { Secret } from "jsonwebtoken";

export const generateTokenReset = (
  payload: { email: string; status: string },
  secret: Secret,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expiresIn,
  });
  return token;
};
