import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
    try {
        // Remove spaces from EMAIL_PASS (Gmail app passwords sometimes have spaces)
        const emailPassword = process.env.EMAIL_PASS.replace(/\s/g, '');
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: emailPassword,
            },
        });
        
        const url = `${process.env.FRONTEND_URL}/verify/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,  // Use actual Gmail address, not custom domain
            to: email,
            subject: "Verify your email address - CrackedTube",
            html: `<h1>Welcome to CrackedTube!</h1>
                   <p>Please click the link below to verify your email:</p>
                   <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                   <br><br>
                   <p><strong>If the link above is unclickable, copy and paste this URL into your browser:</strong></p>
                   <p>${url}</p>`,
        });
        
        console.log("Verification email sent successfully to:", email);
    } catch (error) {
        console.error("Error sending verification email:", error.message);
        throw new Error("Failed to send verification email: " + error.message);
    }
};