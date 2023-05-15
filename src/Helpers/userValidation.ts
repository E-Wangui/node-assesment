import joi from "joi";

export const userRegistrationSchema = joi.object({
  name: joi.string().required().min(5),
  email: joi
    .string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } }),
  password: joi.string().min(6).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});
