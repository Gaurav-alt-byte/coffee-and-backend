import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.BREVO_USER,  // your Brevo account email
        pass: process.env.BREVO_PASS,  // SMTP key from Brevo (not your password)
    },
});

export const sendVerificationEmail = async (email, token) => {
    try {
        console.log("Starting email send to:", email);
        const url = `${process.env.FRONTEND_URL}/verify/${token}`;

        await transporter.sendMail({
            from: process.env.BREVO_USER,
            to: email,
            subject: "CrackedTube - Verify Your Email",
            html: `<p><a href="${url}">Click here to verify your email</a></p>`,
        });

        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Email Error:", error);
        throw error;
    }
};