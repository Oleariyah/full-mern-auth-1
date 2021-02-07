const express = require("express");
const authControllers = require("../controllers/authControllers");
const {
    validateRegister,
    validateLogin,
    forgotPasswordValidator,
    resetPasswordValidator
} = require("../helpers/validate")

const {
    registerController,
    activationController,
    loginController,
    forgotPasswordController,
    resetPasswordController,
    googleController,
    facebookController
} = authControllers;

const router = express.Router();

router.post("/register", validateRegister, registerController);
router.post("/login", validateLogin, loginController);
router.post("/forgotpassword", forgotPasswordValidator, forgotPasswordController);
router.put("/reset", resetPasswordValidator, resetPasswordController);
router.post("/activate", activationController);
router.post("/googlelogin", googleController);
router.post("/facebooklogin", facebookController);

module.exports = router;