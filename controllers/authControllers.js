const User = require("../models/authModel");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/dbErrorHandling");
const emailConfig = require("../config/email.config");
const fetch = require('node-fetch');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);

const registerController = (req, res) => {
    const { name, email, password } = req.body.user;
    const errors = validationResult(req.body.user); //request body validation

    if (!errors.isEmpty()) {
        const firstError = errors.array().map((error) => error.msg)[0];
        return res.status(422).json({
            error: firstError
        });
    } else {
        User.findOne({ email }).exec((err, user) => {
            //if user exists
            if (user) {
                return res.status(400).json({
                    error: "Email is taken!"
                });
            }
        });
        //generate token

        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION,
            { expiresIn: "15m" }
        );

        //activation request email
        const subject = "Activate Account Link";

        emailConfig(token, email, subject, (type = "activate"))
            .then((sent) => {
                return res.json({
                    message: `Email was successfully sent to ${email}`
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            });
    }
};

const activationController = (req, res) => {
    const { token } = req.body;

    if (token) {
        //verify the token is valid or expired
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: "Activation token has Expired! Please, sign up again"
                });
            } else {
                const { name, email, password } = jwt.decode(token);
                const user = new User({
                    name,
                    email,
                    password
                });
                user.save((err, user) => {
                    if (err) {
                        return res.status(401).json({
                            error: errorHandler(err)
                        });
                    } else {
                        return res.json({
                            success: true,
                            message: "User registration was successful!"
                        });
                    }
                });
            }
        });
    } else {
        return res.json({
            message: "Something went wrong! Please try to sign up again."
        });
    }
};

const loginController = (req, res) => {
    const { email, password } = req.body.user;
    const errors = validationResult(req.body.user); //request body validation

    if (!errors.isEmpty()) {
        const firstError = errors.array().map((error) => error.msg)[0];
        return res.status(422).json({
            error: firstError
        });
    } else {
        User.findOne({
            email
        }).exec((err, user) => {
            //if user exists
            if (err || !user) {
                return res.status(400).json({
                    error: "No registered user with the provided email! Please, sign up."
                });
            }

            //authenticate
            if (!user.authenticate(password)) {
                return res.status(400).json({
                    error: "The provided email and password do not match."
                });
            }

            //Generate Token
            const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_KEY,
                { expiresIn: "7d" } //token valid in 7 days/Remember me can be set to 30 days
            );

            const { _id, name, role } = user;
            return res.json({
                token, user: { _id, name, email, role },
                message: "Welcome! You have succssfully logged in."
            });
        });
    }
};

const forgotPasswordController = (req, res) => {
    const { email } = req.body;
    const errors = validationResult(req.body); //request body validation

    if (!errors.isEmpty()) {
        const firstError = errors.array().map((error) => error.msg)[0];
        return res.status(422).json({
            error: firstError
        });
    } else {
        User.findOne({ email }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User with that email does not exist."
                });
            }

            //Generate Token for user with provided id, valid for 10 minutes
            const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD,
                { expiresIn: "10m" }
            );
            const subject = "Reset Password Link";
            return user.updateOne({ resetPasswordLink: token },
                (err, success) => {
                    //reset password request email
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }

                    emailConfig(token, email, subject, (type = "reset"))
                        .then(() => {
                            return res.json({
                                message: `Email was successfully sent to ${email}`
                            });
                        })
                        .catch((err) => {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        });
                }
            );
        }
        );
    }
};

const resetPasswordController = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body.user;
    const errors = validationResult(req.body.user);

    if (!errors.isEmpty()) {
        const firstError = errors.array().map((error) => error.msg)[0];
        return res.status(422).json({
            errors: firstError
        });
    } else {
        if (resetPasswordLink) {
            jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
                if (err) {
                    return res.status(400).json({
                        error: "Expired link. Try again"
                    });
                }

                User.findOne({ resetPasswordLink }, (err, user) => {
                    if (err || !user) {
                        return res.status(400).json({
                            error: "Something went wrong. Try later"
                        });
                    }

                    const updatedFields = {
                        password: newPassword,
                        resetPasswordLink: ""
                    };

                    user = _.extend(user, updatedFields);
                    user.save((err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Error resetting user password"
                            });
                        }

                        res.json({
                            message: `Great! Now you can login with your new password`
                        });
                    });
                }
                );
            }
            );
        }
    }
};

// Google Login
const googleController = (req, res) => {
    const { idToken } = req.body;

    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
        .then((response) => {
            const { email_verified, name, email } = response.payload;

            if (email_verified) {
                User.findOne({
                    email
                }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_KEY,
                            { expiresIn: "7d" }
                        );
                        const { _id, email, name, role } = user;
                        return res.json({
                            token,
                            user: { _id, email, name, role }
                        });
                    } else {
                        let password = email + process.env.ACCESS_TOKEN_KEY;
                        user = new User({ name, email, password });
                        user.save((err, data) => {
                            if (err) {
                                console.log("ERROR GOOGLE LOGIN ON USER SAVE", err);
                                return res.status(400).json({
                                    error: "User signup failed with google"
                                });
                            }

                            const token = jwt.sign(
                                { _id: data._id },
                                process.env.ACCESS_TOKEN_KEY,
                                {
                                    expiresIn: "7d"
                                }
                            );
                            const { _id, email, name, role } = data;
                            return res.json({
                                token, user: { _id, email, name, role }
                            });
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    error: "Google login failed. Try again"
                });
            }
        });
};

const facebookController = (req, res) => {
    const { userID, accessToken } = req.body;

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

    return (
        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then(response => {
                const { email, name } = response;
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_KEY, {
                            expiresIn: '7d'
                        });
                        const { _id, email, name, role } = user;
                        return res.json({
                            token,
                            user: { _id, email, name, role }
                        });
                    } else {
                        let password = email + process.env.ACCESS_TOKEN_KEY;
                        user = new User({ name, email, password });
                        user.save((err, data) => {
                            if (err) {
                                console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                                return res.status(400).json({
                                    error: 'User signup failed with facebook'
                                });
                            }
                            const token = jwt.sign(
                                { _id: data._id },
                                process.env.ACCESS_TOKEN_KEY,
                                { expiresIn: '7d' }
                            );
                            const { _id, email, name, role } = data;
                            return res.json({
                                token,
                                user: { _id, email, name, role }
                            });
                        });
                    }
                });
            })
            .catch(error => {
                res.json({
                    error: 'Facebook login failed. Try later'
                });
            })
    );
};

module.exports = {
    registerController,
    activationController,
    forgotPasswordController,
    loginController,
    resetPasswordController,
    googleController,
    facebookController
};
