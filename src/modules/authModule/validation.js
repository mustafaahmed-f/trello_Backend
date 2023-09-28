import joi from "joi";

export const signUp = joi
  .object({
    userName: joi.string().alphanum().required().min(3).max(20),
    password: joi
      .string()
      .min(8)
      .max(25)
      .pattern(
        new RegExp(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,25}$/
        )
      ),
    firstName: joi
      .string()
      .min(3)
      .max(15)
      .required()
      .pattern(new RegExp(/^[a-zA-Z]{3,15}$/)),
    lastName: joi
      .string()
      .min(3)
      .max(15)
      .required()
      .pattern(new RegExp(/^[a-zA-Z]{3,15}$/)),
    email: joi
      .string()
      .email({ tlds: { allow: ["com", "net", "eg"] }, maxDomainSegments: 4 })
      .required(),
    age: joi.number().min(15).max(100),
    phone: joi.string().pattern(new RegExp("^(01)[1250][0-9]{8}$")),
    gender: joi.string().required().valid("male", "female"),
    rePassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required()
  .unknown(true);

export const logIn = joi
  .object({
    email: joi
      .string()
      .email({ tlds: { allow: ["com", "net", "eg"] }, maxDomainSegments: 4 }),
    password: joi
      .string()
      .min(8)
      .max(25)
      .pattern(
        new RegExp(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,25}$/
        )
      )
      .required(),
    phone: joi.string().pattern(new RegExp(/^(01)[1250][0-9]{8}$/)),
    userName: joi.string().alphanum().min(3).max(20),
  })
  .required()
  .unknown(true);

export const confirmEmail = joi
  .object({
    token: joi
      .string()
      .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
      .required(),
  })
  .required()
  .unknown(true);

export const requestNewConfirmEmail = joi
  .object({
    token: joi
      .string()
      .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
      .required(),
  })
  .required()
  .unknown(true);

export const forgotPass = joi
  .object({
    email: joi
      .string()
      .email({ tlds: { allow: ["com", "net", "eg"] }, maxDomainSegments: 4 })
      .required(),
  })
  .required()
  .unknown(true);

export const newPassword = joi
  .object({
    token: joi
      .string()
      .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
      .required(),
    newPassword: joi
      .string()
      .min(8)
      .max(25)
      .pattern(
        new RegExp(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,25}$/
        )
      )
      .required(),
    confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
  })
  .required()
  .unknown(true);

export const unsubscribeUser = joi
  .object({
    token: joi
      .string()
      .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
      .required(),
  })
  .required()
  .unknown(true);
