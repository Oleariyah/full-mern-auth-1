"use strict";
const nodemailer = require("nodemailer");

const emailConfig = async (token, email, subject, type) => {
    if (token && email) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: `${process.env.NODEMAILER_USER}`,
                pass: `${process.env.NODEMAILER_PASSWORD}`
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Fred Foo 👻" <oleariyah@gmail.com>', // sender address
            to: `${email}`, // list of receivers
            subject: `${subject} ✔`, // Subject line
            text: "Hello world?",
            html: `<h1>Please click on the link to ${type === "activate" ? `activate your account` : `reset your password`}</h1>
            ${type === "activate"
                    ? `<p>${process.env.CLIENT_URL}/#/activate?q=${token}</p>`
                    : `<p>${process.env.CLIENT_URL}/#/reset?q=${token}</p>`}
            <hr>
             <p>This email contain sensitive info!</p>
             <p>${process.env.CLIENT_URL}</p>
            `,
        });

        console.log("Message sent: %s", info.messageId);
    }
}

emailConfig().catch(console.error);

module.exports = emailConfig