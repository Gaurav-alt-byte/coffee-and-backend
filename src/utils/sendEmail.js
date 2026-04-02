
import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const url = `${process.env.FRONTEND_URL}/verify/${token}`;

    await transporter.sendMail({
        from: '"Cracked Tube" <verify@crackedtube.com>',
        to: email,
        subject: "Verify your email address",
        html: `<h1>Welcome!</h1>
               <p>Please click the link below to verify your email:</p>
               <a href="${url}">Verify Email</a>`,
    });
};