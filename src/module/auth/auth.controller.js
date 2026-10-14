import { Router } from "express";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { login, signup, signupOrLoginWithGoogle } from "./auth.service.js";
import { successResponse } from "../../commen/response/success.response.js";

export const authRouter = Router();

authRouter.post(
  "/signup",
  validationMiddleware(signupSchema),
  async (req, res) => {
    await signup(req.body);
    successResponse({
      res,
      statusCode: 201,
      msg: "Account created successfully",
    });
  },
);

authRouter.post(
  "/login",
  validationMiddleware(loginSchema),
  async (req, res) => {
    const result = await login(req.body);
    successResponse({
      res,
      statusCode: 200,
      msg: "done",
      data: result,
    });
  },
);

authRouter.post("signup-with-google", async (req, res) => {
  const { statusCode, tokens } = await signupOrLoginWithGoogle(
    req.body.idToken,
  );
  successResponse({ res, statusCode: statusCode, data: tokens });
});
