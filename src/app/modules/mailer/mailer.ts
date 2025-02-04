

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,   // Ensure you're using the correct host, such as smtp.gmail.com
  port: Number(process.env.SMTP_PORT),
  secure: false,                 // Set to true if using port 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER, // Your Gmail address
    pass: process.env.SMTP_PASS, // Your Gmail app password or regular password
  },
  
});
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS);


const sendEmail = async (values: any) => {
  try {
    const info = await transporter.sendMail({
      from: `"Fremst online shop" <${process.env.SMTP_USER}>`,  // Ensure the correct format here
      to: values.to,
      subject: values.subject,
      html: values.html,
    });
    
    console.log('Mail sent successfully', info.accepted);
  } catch (error) {
    console.log('Email Error:', error);
  }
};

export const emailHelper = {
  sendEmail,
};
