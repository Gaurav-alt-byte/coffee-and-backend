import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";

// Initialize the API client
const apiInstance = new TransactionalEmailsApi();

// Set your API Key (Get this from Brevo -> SMTP & API -> API Keys)
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export const sendVerificationEmail = async (email, token) => {
    try {
        console.log("Starting email send to:", email);
        const url = `${process.env.FRONTEND_URL}/verify/${token}`;

        const sendSmtpEmail = new SendSmtpEmail();

        sendSmtpEmail.subject = "CrackedTube - Verify Your Email";
        sendSmtpEmail.htmlContent = `<html><body><p><a href="${url}">Click here to verify your email</a></p></body></html>`;
        
        // This MUST be the email from your screenshot: crackedtube.auth@gmail.com
        sendSmtpEmail.sender = { "name": "CrackedTube", "email": "crackedtube.auth@gmail.com" };
        sendSmtpEmail.to = [{ "email": email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        console.log("Email sent successfully via API! ID:", data.body.messageId);
    } catch (error) {
        // This will now give you a detailed error if something is wrong with the key
        console.error("Email API Error:", error.response ? error.response.body : error);
        throw error;
    }
};