const { check } = require("express-validator");

//register
exports.validateRegister = [
    check("name", "Name is required").isEmpty()
        .isLength({
            min: 3,
            max: 32
        }).withMessage("Name must be between 3 to 32 characters"),
    check("email").isEmpty().withMessage("Please, enter a valid email address"),
    check("password", "Password is required").notEmpty(),
    check("password").isLength({
        min: 8
    }).withMessage("Password must contain minimum length of 8 characters").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[=+!@#\\$%\\^&\\*\\._\\-\\\\/()])(.{8,})$"/)
        .withMessage("Password must contain a number, uppercase string, lowercase string, and a special character"),
]

//login
exports.validateLogin = [
    check("email", "Email is required").isEmpty().isEmail()
        .withMessage("Please, enter a valid email address"),
    check("email").isEmpty().withMessage("Please, enter a valid email address"),
    check("password", "Password is required").notEmpty(),
    check("password").isLength({
        min: 6
    }).withMessage("Password must contain minimum length of 8 characters").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[=+!@#\\$%\\^&\\*\\._\\-\\\\/()])(.{8,})$"/)
        .withMessage("Password must contain a number, uppercase string, lowercase string, and a special character"),
]

//forgot password
exports.forgotPasswordValidator = [
    check("email")
        .not()
        .isEmpty()
        .isEmail()
        .withMessage("Please, provide a valid email address.")
]

//reset password
exports.resetPasswordValidator = [
    check("newPassword")
        .not()
        .isEmpty()
        .isEmail()
        .isLength({
            min: 8
        }).withMessage("Password must contain minimum length of 8 characters").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[=+!@#\\$%\\^&\\*\\._\\-\\\\/()])(.{8,})$"/)
        .withMessage("Password must contain a number, uppercase string, lowercase string, and a special character"),
]