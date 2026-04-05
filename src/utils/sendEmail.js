import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, token) => {
    try {
        console.log("Starting email send to:", email);

        const url = `${process.env.FRONTEND_URL}/verify/${token}`;

        await resend.emails.send({
            from: "CrackedTube <onboarding@resend.dev>",
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