import { tokenTypeEnum } from "../commen/enum/token.enum.js";
import { unauthorizedException } from "../commen/exceptions/exceptions.js";
import { checkToken } from "../commen/security/tokens.js";

export function auth(tokenType = tokenTypeEnum.ACCESS) {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      throw unauthorizedException();
    }

    const { user, payload } = await checkToken(token, tokenType);
    req.user = user;
    req.payload = payload;
    next();
  };
}
