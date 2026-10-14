import {
  badRequestException,
  conflictExceptions,
  unauthorizedException,
} from "../../commen/exceptions/exceptions.js";
import { encryptValue } from "../../commen/security/encryption.js";
import { compareValue, hashValue } from "../../commen/security/hashing.js";
import { createLoginTokens } from "../../commen/security/tokens.js";
import { GOOGLE_CLIENT_ID } from "../../config/config.js";
import { userModel } from "../../DB/model/user.model.js";
import { createDoc, findOneDoc } from "../../DB/repo.js";

export async function signup(data) {
  const { email } = data;
  const user = await findOneDoc({ model: userModel, filter: { email } });
  if (user) {
    throw conflictExceptions({ errmsg: "Email already exists" });
  }

  data.password = await hashValue(data.password);
  if (data.phoneNumber) {
    data.phoneNumber = encryptValue(data.phoneNumber);
  }

  await createDoc({ model: userModel, data });
}

export async function login(data) {
  const { email, password } = data;
  const user = await findOneDoc({ model: userModel, filter: { email } });
  if (!user) {
    throw unauthorizedException({ errMsg: "Invalid email or password" });
  }
  const isMatch = await compareValue(password, user.password);
  if (!isMatch) {
    throw unauthorizedException({ errMsg: "Invalid email or password" });
  }

  return createLoginTokens({ user });
}

/////////////////////////////////
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client();
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

export async function signupOrLoginWithGoogle(idToken) {
  const result = await verify(idToken);

  if (!result.email_verified) {
    throw unauthorizedException();
  }

  const user = findOneDoc({
    model: userModel,
    filter: { email: result.email },
  });
  if (user) {
    if (user.provider === userProviderEnum.SYSTEM) {
      throw badRequestException({ errmsg: "you need to login using password" });
    }
    if (user.provider === userProviderEnum.GOOGLE) {
      return { statusCode: 200, tokens: createLoginTokens({ user }) };
    }
  }

  const [newUser] = await createDoc({
    model: userModel,
    insertData: {
      username: `${result.given_name} ${result.family_name}`,
      email: result.email,
      provider: userProviderEnum.GOOGLE,
      confirmEmail: true,
    },
  });

  return { statusCode: 201, tokens: createLoginTokens({ newUser }) };
}
