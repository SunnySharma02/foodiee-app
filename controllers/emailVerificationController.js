import nodemailer from 'nodemailer';
import dotenv from 'dotenv'

dotenv.config()

const verifyemail = async (email, link) => {
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure:true,
            auth: {
                user: process.env.FOODIEE_MAIL,
                pass: process.env.FOODIEE_PASS,
            },
        });

        let info = await transporter.sendMail({
            from: `"foodiee.." <${process.env.FOODIEE_MAIL}>`,
            to: email,
            subject: "Email Verification - foodiee..",
            text: "Welcome",
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Email Verification</h2>
                    <p>Hello,</p>
                    <p>Thank you for registering with foodiee... To complete your registration, please verify your email address by clicking the link below:</p>
                    <p>
                        <a href="${link}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    </p>
                    <p>If the button above doesn't work, copy and paste the following URL into your web browser:</p>
                    <p>${link}</p>
                    <p>If you did not create an account, no further action is required.</p>
                    <p>Thank you,<br>foodiee..</p>
                </div>`
        });

        console.log("Mail sent successfully:", info.response);
    } catch (error) {
        console.error("Mail failed to send:", error);
    }
};

export default verifyemail;