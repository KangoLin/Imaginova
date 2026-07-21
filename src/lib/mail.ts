import nodemailer from "nodemailer";

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (process.env.SMTP_PORT || "465") === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const FROM_ADDRESS = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@imaginova.online";

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  if (!transporter) {
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: `Imaginova <${FROM_ADDRESS}>`,
    to: email,
    subject: "Imaginova 注册验证码 / Registration Code",
    text: `您的验证码: ${code}\n验证码 10 分钟内有效，请勿泄露给他人。\n\nYour verification code: ${code}\nValid for 10 minutes. Do not share this code.`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Imaginova</h2>
        <p>您的注册验证码为：</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 16px; background: #f0fdfa; border-radius: 8px; color: #0d9488;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">验证码 10 分钟内有效，请勿泄露给他人。</p>
        <p style="color: #666; font-size: 14px;">Valid for 10 minutes. Do not share this code.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetLink(email: string, link: string): Promise<void> {
  if (!transporter) {
    console.log(`[DEV] Password reset link for ${email}: ${link}`);
    return;
  }

  await transporter.sendMail({
    from: `Imaginova <${FROM_ADDRESS}>`,
    to: email,
    subject: "Imaginova 密码重置 / Password Reset",
    text: `请点击以下链接重置密码（1 小时内有效）：\n${link}\n\nReset your password (valid for 1 hour):\n${link}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Imaginova</h2>
        <p>请点击下方按钮重置密码（1 小时内有效）：</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${link}" style="display: inline-block; padding: 12px 32px; background: #0d9488; color: #fff; text-decoration: none; border-radius: 8px; font-size: 16px;">
            重置密码 / Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">如果按钮无法点击，请复制以下链接到浏览器：</p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">${link}</p>
        <p style="color: #666; font-size: 14px;">此链接 1 小时内有效。如非本人操作，请忽略此邮件。</p>
        <p style="color: #666; font-size: 14px;">Valid for 1 hour. If you didn't request this, please ignore.</p>
      </div>
    `,
  });
}
