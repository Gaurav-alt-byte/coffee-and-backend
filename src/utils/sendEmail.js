import { BrevoClient } from "@getbrevo/brevo";

// Initialize the client with your 64-character API Key
const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

export const sendVerificationEmail = async (email, token) => {
    try {
        console.log("Starting email send to:", email);
        const url = `${process.env.FRONTEND_URL}/verify/${token}`;

        // The new v5 SDK uses a simple object instead of complex class instances
        await client.transactionalEmails.sendTransacEmail({
            subject: "CrackedTube - Verify Your Email",
            htmlContent: `<html><body><p><a href="${url}">Click here to verify your email</a></p></body></html>`,
            
            // This MUST match your verified Gmail: crackedtube.auth@gmail.com
            sender: { 
                name: "CrackedTube", 
                email: "crackedtube.auth@gmail.com" 
            },
            to: [
                { email: email }
            ],
        });

        console.log("Email sent successfully via API!");
    } catch (error) {
        // New SDK error handling
        console.error("Brevo v5 API Error:", error.message);
        if (error.body) console.error("Details:", error.body);
        throw error;
    }
};