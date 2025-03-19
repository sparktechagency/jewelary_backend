import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = async (orderDetails: any, filePath: string) => {
  // Create a new PDF document with A4 size
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    info: {
      Title: `Invoice ${orderDetails._id || ''}`,
      Author: 'ZAKEE BOXES'
    }
  });

  doc.pipe(fs.createWriteStream(filePath));

  // Set the background color for entire page
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a1a'); // Dark background

  // Add company logo at the top
  const logoPath = path.join(__dirname, 'logo', 'logo.png');
  try {
    doc.image(logoPath, doc.page.width / 2 - 25, 40, { width: 50 });
  } catch (err) {
    console.error('Error loading logo image:', err);
  }

  // Add company name below logo
  doc.font('Helvetica-Bold').fontSize(24).fill('#ffffff').text('', { align: 'center' });
  doc.fontSize(12).fill('#FF9800').text('BOXES', { align: 'center' });
  doc.moveDown(1);

  // Create two columns for billing and invoice details
  // Left column: Bill To
  const billingY = 135;
  doc.font('Helvetica-Bold').fontSize(14).fill('#ffffff').text('Bill To:', 50, billingY);
  doc.font('Helvetica').fontSize(12).fill('#ffffff').text(orderDetails.contactName || '', 50, doc.y + 5);
  
  // Use address from order details
  doc.text(orderDetails.deliverTo || '', 50, doc.y + 5);
  doc.text(orderDetails.contactNumber || '', 50, doc.y + 5);
  
  // Right column: Invoice details
  const rightColumnX = 350;
  doc.font('Helvetica-Bold').fontSize(16).fill('#ffffff').text('Invoice', rightColumnX, billingY);
  
  doc.font('Helvetica').fontSize(10).fill('#ffffff');
  doc.text(`Invoice No: ${orderDetails._id || ''}`, rightColumnX, doc.y + 10);
  doc.text(`Date: ${new Date(orderDetails.createdAt || Date.now()).toLocaleDateString()}`, rightColumnX, doc.y + 5);
  doc.text(`Terms: NET 30`, rightColumnX, doc.y + 5);
  
  // Calculate due date (30 days from now)
  const dueDate = new Date(orderDetails.createdAt || Date.now());
  dueDate.setDate(dueDate.getDate() + 30);
  doc.text(`Due Date: ${dueDate.toLocaleDateString()}`, rightColumnX, doc.y + 5);
  
  // Ensure we have a consistent starting point for the table
  const tableTop = 230;

  // Table Headers
  doc.rect(40, tableTop - 5, doc.page.width - 80, 25).fill('#2d2d2d');
  
  doc.fill('#ffffff').font('Helvetica-Bold').fontSize(12);
  doc.text('Description', 50, tableTop);
  doc.text('Quantity', 280, tableTop, { width: 70, align: 'center' });
  doc.text('Rate', 350, tableTop, { width: 70, align: 'center' });
  doc.text('Amount', 420, tableTop, { width: 80, align: 'right' });
  
  let tableRowY = tableTop + 30;

  // Add product rows
  let rowCount = 0;
  const items = Array.isArray(orderDetails.items) ? orderDetails.items : [];

  items.forEach((item: any) => {
    rowCount++;
    const rowY = tableRowY;
    
    // Alternating row backgrounds
    doc.rect(40, rowY - 5, doc.page.width - 80, 45).fill('#262626');
    
    // Try to load product image if available
    try {
      if (item.image) {
        const imagePath = path.join(__dirname, 'products', `${item.image}.png`);
        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, 50, rowY, { width: 30, height: 30 });
        }
      }
    } catch (err) {
      // Just continue if image isn't available
    }
    
    // Always show product name - never fallback to ID
    const productName = item.productName || 'Unnamed Product';
    
    // Product description with size and color
    doc.font('Helvetica').fontSize(10).fill('#ffffff');
    doc.text(productName, 90, rowY);
    doc.fontSize(8).fill('#cccccc');
    
    // Display variation details
    if (item.variation) {
      // Check if size exists and display it
      if (item.variation.size) {
        doc.text(`Size: ${item.variation.size}`, 90, doc.y + 2);
      }
      
      // Set color for the color text
      let colorName = '';
      if (item.variation.color !== null && item.variation.color !== undefined) {
        // Convert to string to avoid the "toLowerCase is not a function" error
        colorName = String(item.variation.color);
      }
      
      // Only display color if it exists
      if (colorName) {
        let textColor = '#ffffff';
        
        // Determine text color based on common color names
        if (colorName.toLowerCase() === 'red') textColor = '#ff6b6b';
        else if (colorName.toLowerCase() === 'green') textColor = '#6bff6b';
        else if (colorName.toLowerCase() === 'blue') textColor = '#6b6bff';
        else if (colorName.toLowerCase() === 'yellow') textColor = '#ffff6b';
        else if (colorName.toLowerCase() === 'black') textColor = '#ffffff';
        else if (colorName.toLowerCase() === 'white') textColor = '#ffffff';
        
        doc.fillColor(textColor);
        doc.text(`Color: ${colorName}`, 90, doc.y + 2);
      }
    }
    
    // Calculate item total
    const quantity = item.quantity || 0;
    const price = item.variation?.price || 0;
    const itemTotal = quantity * price;
    
    // Quantity, Rate, Amount - properly aligned
    doc.fontSize(10).fill('#ffffff');
    doc.text(`${quantity}`, 280, rowY, { width: 70, align: 'center' });
    doc.text(`AUS ${price.toFixed(2)}`, 350, rowY, { width: 70, align: 'center' });
    doc.text(`AUS ${itemTotal.toFixed(2)}`, 420, rowY, { width: 80, align: 'right' });
    
    tableRowY = rowY + 50; // Consistent spacing between rows
  });
  
  // Move down after the table
  doc.y = tableRowY + 20;
  
  // Payment instruction header
  doc.rect(40, doc.y, doc.page.width - 80, 30).fill('#FF5722');
  doc.fill('#ffffff').font('Helvetica-Bold').fontSize(12).text('PAYMENT INSTRUCTION', 50, doc.y + 10, { align: 'left' });
  
  // Payment details
  doc.y += 35;
  doc.fill('#ffffff').font('Helvetica').fontSize(10);
  doc.text('NAME: ZAKEE BOXES', 50, doc.y);
  doc.text('BSB: 010123', 50, doc.y + 15);
  doc.text('ACCOUNT: 15278856655', 50, doc.y + 15);
  
  // Calculate totals from order details
  const subtotal = orderDetails.totalAmount || 0;
  const deliveryCharge = orderDetails.deliveryCharge || 0;
  const total = subtotal + deliveryCharge; 
  const paid = orderDetails.paidAmount || 0;
  const balanceDue = orderDetails.dueAmount || (total - paid);
  
  // Totals section on the right
  const totalsY = tableRowY + 20;
  doc.font('Helvetica').fontSize(10).fill('#ffffff');
  doc.text(`Subtotal:`, 350, totalsY);
  doc.text(`AUS ${subtotal.toFixed(2)}`, 450, totalsY, { align: 'right' });
  
  doc.text(`Delivery Charge:`, 350, totalsY + 15);
  doc.text(`AUS ${deliveryCharge.toFixed(2)}`, 450, totalsY + 15, { align: 'right' });
  
  doc.text(`Total:`, 350, totalsY + 30);
  doc.text(`AUS ${total.toFixed(2)}`, 450, totalsY + 30, { align: 'right' });
  
  doc.text(`Paid:`, 350, totalsY + 45);
  doc.text(`AUS ${paid.toFixed(2)}`, 450, totalsY + 45, { align: 'right' });
  
  // Payment status
  const paymentStatus = orderDetails.paymentStatus || 'Pending';
  doc.text(`Payment Status:`, 350, totalsY + 60);
  doc.text(`${paymentStatus}`, 450, totalsY + 60, { align: 'right' });
  
  // Balance due with highlighting
  doc.rect(350, totalsY + 75, 150, 25).fill('#262626');
  doc.font('Helvetica-Bold').fontSize(12).fill('#FF5722');
  doc.text(`Balance DUE:`, 355, totalsY + 82);
  doc.text(`AUS ${balanceDue.toFixed(2)}`, 450, totalsY + 82, { align: 'right' });
  
  // Create payment URL
  const paymentUrl = `http://zakeebox.com/payments/${orderDetails._id}`;
  
  // Add Pay Now button with link
  doc.y = Math.max(doc.y, totalsY + 120);
  const buttonY = doc.y;
  doc.roundedRect(doc.page.width / 2 - 60, buttonY, 120, 40, 5).fill('#FF9800');
  doc.font('Helvetica-Bold').fontSize(14).fill('#ffffff');
  doc.text('PAY NOW', doc.page.width / 2 - 60, buttonY + 12, { width: 120, align: 'center', link: paymentUrl });
  
  // Add payment link below button
  doc.font('Helvetica').fontSize(10).fill('#ffffff');
  doc.text('Complete your payment by clicking the button above or using the link below:', 50, buttonY + 50, { align: 'center' });
  doc.fillColor('#4da6ff').text(paymentUrl, { align: 'center', link: paymentUrl, underline: true });
  
  // Footer
  doc.font('Helvetica').fontSize(8).fill('#cccccc');
  doc.moveDown(2);
  doc.text('Thank you for your business!', { align: 'center' });
  doc.text(`Order Date: ${new Date(orderDetails.createdAt || Date.now()).toLocaleDateString()}`, { align: 'center' });
  
  // End the document
  doc.end();
  
  return filePath;
};