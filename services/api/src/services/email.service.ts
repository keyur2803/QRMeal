import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465, // true for 465, false for other ports
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  if (!env.isProd && (!env.smtp.user || !env.smtp.pass)) {
    console.log(`[DEV] Sending OTP ${otp} to ${to} (SMTP not configured)`);
    return;
  }

  const mailOptions = {
    from: `"QRMEAL Support" <${env.smtp.user}>`,
    to,
    subject: "Your QRMEAL Login OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
        <h2 style="color: #0d9488; margin-top: 0;">Welcome to QRMEAL!</h2>
        <p>Use the following code to complete your login. It will expire in 10 minutes.</p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #334155; margin: 24px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #64748b;">If you didn't request this code, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 QRMEAL. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendInvoiceEmail(to: string, orderDetails: { orderCode: string; total: number; items: { name: string; qty: number; price: number }[] }) {
  if (!env.isProd && (!env.smtp.user || !env.smtp.pass)) {
     console.log(`[DEV] Sending Invoice for ${orderDetails.orderCode} to ${to} (SMTP not configured)`);
     return;
  }

  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">${item.name} x${item.qty}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">₹${(item.price * item.qty).toFixed(0)}</td>
    </tr>
  `).join("");

  const mailOptions = {
    from: `"QRMEAL Invoices" <${env.smtp.user}>`,
    to,
    subject: `Your Invoice from QRMEAL - #${orderDetails.orderCode}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 24px;">
          <div>
            <h2 style="color: #0d9488; margin: 0;">QRMEAL</h2>
            <p style="font-size: 14px; color: #64748b; margin: 4px 0;">Order Receipt</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 14px; color: #64748b; margin: 0;">Order #${orderDetails.orderCode}</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 2px 0;">${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="text-align: left; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding-bottom: 8px; border-bottom: 2px solid #f1f5f9;">Description</th>
              <th style="padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 16px; font-weight: 700;">Total</td>
              <td style="padding-top: 16px; text-align: right; font-weight: 800; color: #0d9488; font-size: 20px;">₹${orderDetails.total.toFixed(0)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #475569;">Thank you for dining with us!</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">We hope to see you again soon.</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated receipt. No need to reply.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
