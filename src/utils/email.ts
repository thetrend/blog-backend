import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendEmail = async (
  input: { to: string; subject: string, html: string; }
) => {
  try {
    const { to, subject, html } = input;
    const message = {
      to,
      from: 'blog@graced.is',
      subject,
      html,
    };

    const send = await resend.emails.send(message);
    return send;
  } catch (error: any) {
    console.log(error);
  }
};
