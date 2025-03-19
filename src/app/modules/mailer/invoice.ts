// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config(); // Load environment variables from .env file

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,   
//   port: Number(process.env.SMTP_PORT),
//   secure: false,              
//   auth: {
//     user: process.env.SMTP_USER, 
//     pass: process.env.SMTP_PASS, 
//   },
  
// });



// const sendEmail = async (values: { to: string, subject: string, html: string }) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Zakke online shop" <${process.env.SMTP_USER}>`,  // Ensure the correct format here
//       to: values.to,
//       subject: values.subject,
//       html: values.html,
//     });
    
//     console.log('Mail sent successfully', info.accepted);
//   } catch (error) {
//     console.log('Email Error:', error);
//   }
// };

  
  
  
  
//   export const emailHelper = {
//     sendEmail,
    
//   };
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Check SMTP environment variables
console.log("SMTP Host:", process.env.SMTP_HOST);
console.log("SMTP Port:", process.env.SMTP_PORT);
console.log("SMTP User:", process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,   
  port: Number(process.env.SMTP_PORT),
  secure: false,               // Set to true if using SSL (port 465)
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

const sendEmail = async (values: { to: string, subject: string, html: string }) => {
  try {
    // Log the response from sending email
    const info = await transporter.sendMail({
      from: `"Zakke online shop" <${process.env.SMTP_USER}>`,  // Ensure the correct format here
      to: values.to,
      subject: values.subject,
      html: values.html,
    });
    
    console.log('Mail sent successfully:', info.accepted);
  } catch (error) {
    console.log('Email Error:', error);
  }
};

export const emailHelper = {
  sendEmail,
};
