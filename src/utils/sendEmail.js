import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
    try {
        console.log("Starting email send to:", email);
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const url = `${process.env.FRONTEND_URL}/verify/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "CrackedTube - Verify Your Email",
            text: `Click here to verify: ${url}`,
            html: `<p><a href="${url}">Click here to verify your email</a></p>`,
        });

        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Email Error:", error);
        throw error;
    }
};