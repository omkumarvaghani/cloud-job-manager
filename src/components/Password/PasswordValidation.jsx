import * as Yup from "yup";

const PasswordValidationSchema = Yup.string()
  .min(12, "Password must be at least 12 characters long")
  // .max(16, "Password must not exceed 16 characters")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter (a-z)")
  .matches(/\d/, "Password must contain at least one number (0-9)")
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character (e.g., !, @, #, $)"
  )
  .notOneOf(
    ["password", "1234", "abcd", "qwerty", "admin", "welcome"],
    'Password cannot contain common words like "password", "1234", etc.'
  )
  .test(
    "no-sequential-or-repeating",
    "Password cannot contain sequential or repeating patterns (e.g., 1234, abcd)",
    (value) => {
      const sequentialPattern =
        /(0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg)/i;
      return value ? !sequentialPattern.test(value) : false;
    }
  )

  .required("Password is required");

export default PasswordValidationSchema;
