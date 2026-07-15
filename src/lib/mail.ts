import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = process.env.RESEND_FROM || "noreply@imaginova.online";

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  if (!resend) {
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: `Imaginova <${FROM_ADDRESS}>`,
    to: [email],
    subject: "Imaginova 注册验证码 / Registration Code",
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

  if (error) throw new Error(error.message);
}
