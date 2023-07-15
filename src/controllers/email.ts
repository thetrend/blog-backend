import dotenv from 'dotenv';
import { Resend } from 'resend';
import { NextFunction, Request, Response } from 'express';
import { sendEmail } from '../utils/email';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

export const emailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { to, subject, html } = req.body;
    const input = {
      to,
      subject,
      html,
    };

    const sentMail = await sendEmail(input);

    res.json({ success: sentMail });
  } catch (error: any) {
    next(error);
  }
};