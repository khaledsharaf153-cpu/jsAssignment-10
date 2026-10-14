import * as z from "zod";
import { validateFields } from "../../commen/security/validation.js";

export const loginSchema = z.object({
  body: z.object({
    email: validateFields.email,
    password: validateFields.password,
  }),
});

export const signupSchema = z
  .object({
    body: z.object({ ...validateFields }),
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({
        code: z.custom,
        path: ["password", "confirmPassword"],
        message: "Confirm password doesn't match password",
      });
    }
  });
