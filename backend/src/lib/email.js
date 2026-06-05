import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async (email, resetLink) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // Check if SMTP configuration is present
  const isConfigured = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS;

  if (!isConfigured) {
    console.warn("\n========================================================");
    console.warn("⚠️  SMTP Configuration missing in backend/.env!");
    console.warn(`📩  Password reset requested for: ${email}`);
    console.warn(`🔗  Reset link: ${resetLink}`);
    console.warn("========================================================\n");
    return { sent: false, fallback: true, link: resetLink };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Real-Time Chat App" <${SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #3b82f6; text-align: center;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your Real-Time Chat App account. Please click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; color: #64748b;">${resetLink}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Reset email sent successfully to ${email}: ${info.messageId}`);
    return { sent: true, fallback: false };
  } catch (error) {
    console.error("❌ Error sending reset email via SMTP:", error.message);
    console.warn("\n========================================================");
    console.warn("⚠️  SMTP sending failed! Falling back to console log:");
    console.warn(`📩  Password reset requested for: ${email}`);
    console.warn(`🔗  Reset link: ${resetLink}`);
    console.warn("========================================================\n");
    return { sent: false, fallback: true, error: error.message, link: resetLink };
  }
};
