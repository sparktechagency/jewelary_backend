// sendInvoiceEmail.ts
import nodemailer from 'nodemailer';
import path from 'path';
import { generateInvoicePDF } from './generateInvoice'; // Import generateInvoicePDF

const sendInvoiceEmail = async (userEmail: string, orderDetails: any) => {
  // Step 1: Generate the PDF invoice
  const invoicePath = path.join(__dirname, 'invoice.pdf'); // Path where the invoice will be saved
  await generateInvoicePDF(orderDetails, invoicePath); // Generate PDF

  // Step 2: Set up the email transport using Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Example using Gmail service
    auth: {
      user: process.env.SMTP_USER, // Your SMTP user (email)
      pass: process.env.SMTP_PASS, // Your SMTP password
    },
  });

  // Step 3: Send the email with the PDF attachment
  const emailOptions = {
    from: process.env.SMTP_USER,  // Sender's email
    to: userEmail,                // Receiver's email
    subject: 'Your Order Invoice',  // Subject of the email
    html: `<p>Hello ${orderDetails.contactName},</p>
           <p>Your order has been placed successfully. Please find the invoice attached.</p>`,  // Email body
    attachments: [
      {
        filename: 'invoice.pdf',
        path: invoicePath,  // Path to the generated PDF
      },
    ],
  };

  try {
    const info = await transporter.sendMail(emailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export { sendInvoiceEmail };

