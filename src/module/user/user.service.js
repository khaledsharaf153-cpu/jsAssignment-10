import { badRequestException } from "../../commen/exceptions/exceptions.js";
import { decryptValue } from "../../commen/security/encryption.js";
import { createLoginTokens } from "../../commen/security/tokens.js";
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} from "../../config/config.js";

export function rotateToken(payload) {
  const tokenExpiryDate = payload.iat + JWT_ACCESS_EXPIRES_IN;
  if (tokenExpiryDate > Date.now() / 1000) {
    throw badRequestException({ errMsg: "Old token still valid" });
  }

  return createLoginTokens({
    user: { id: payload.sub, role: payload.aud[0] },
    refreshTokenExpiresIn:
      JWT_REFRESH_EXPIRES_IN - Math.ceil(Date.now() / 1000 - payload.iat),
  });
}

export function getUserProfile(user) {
  user = user.toObject();
  ["id", "_id", "password", "confirmEmail"].forEach((key) => delete user[key]);
  user.phoneNumber = decryptValue(user.phoneNumber);
  return user;
}
