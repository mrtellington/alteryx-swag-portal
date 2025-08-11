import nodemailer from 'nodemailer'

interface OrderConfirmationEmailData {
  to: string
  fullName: string
  orderId: string
  shippingAddress: string
  size?: string
  isAdminNotification?: boolean
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  const { to, fullName, orderId, shippingAddress, size, isAdminNotification } = data

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isAdminNotification ? 'New Order Notification' : 'Order Confirmation'} - Alteryx Swag</title>
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #0066CC 0%, #004499 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .order-details {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #0066CC;
        }
        .button {
          display: inline-block;
          background: #0066CC;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .admin-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${isAdminNotification ? '📦 New Order Received' : '🎉 Order Confirmed!'}</h1>
        <p>${isAdminNotification ? 'New Alteryx New Hire Bundle Order' : 'Thank you for your Alteryx swag order'}</p>
      </div>
      
      <div class="content">
        <h2>${isAdminNotification ? 'New Order Details' : `Hello ${fullName},`}</h2>
        
        ${isAdminNotification ? 
          `<div class="admin-notice">
            <strong>Admin Notification:</strong> A new order has been placed for the Alteryx New Hire Bundle.
          </div>` : 
          '<p>Your order has been successfully placed and confirmed. Here are your order details:</p>'
        }
        
        <div class="order-details">
          <h3>Order Information</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${fullName}</p>
          <p><strong>Product:</strong> Alteryx New Hire Bundle</p>
          <p><strong>Size:</strong> ${size || 'Not specified'}</p>
          <p><strong>Total:</strong> FREE</p>
          <p><strong>Shipping Address:</strong><br>${shippingAddress}</p>
        </div>
        
        ${!isAdminNotification ? `
        <p>Your exclusive Alteryx swag will be shipped to the address provided. You'll receive tracking information once your order ships.</p>
        
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>This is your one-time order limit</li>
          <li>Shipping is free</li>
          <li>Allow 2-3 weeks for delivery</li>
          <li>International shipping available</li>
        </ul>
        
        <p>If you have any questions about your order, please contact the Alteryx team.</p>
        
        <p>Thank you for being part of the Alteryx family!</p>
        ` : `
        <p><strong>Action Required:</strong> Please process this order and ship the New Hire Bundle to the customer.</p>
        <p><strong>Shipping Notes:</strong> This order qualifies for free shipping. International orders may require additional customs documentation.</p>
        `}
        
        <div class="footer">
          <p>© 2024 Alteryx, Inc. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const emailText = `
${isAdminNotification ? 'New Order Notification' : 'Order Confirmation'} - Alteryx Swag

${isAdminNotification ? 'New Order Details' : `Hello ${fullName},`}

${isAdminNotification ? 
  'Admin Notification: A new order has been placed for the Alteryx New Hire Bundle.' : 
  'Your order has been successfully placed and confirmed.'
}

Order Information:
- Order ID: ${orderId}
- Customer: ${fullName}
- Product: Alteryx New Hire Bundle
- Size: ${size || 'Not specified'}
- Total: FREE
- Shipping Address: ${shippingAddress}

${!isAdminNotification ? `
Your exclusive Alteryx swag will be shipped to the address provided. You'll receive tracking information once your order ships.

Important Notes:
- This is your one-time order limit
- Shipping is free
- Allow 2-3 weeks for delivery
- International shipping available

If you have any questions about your order, please contact the Alteryx team.

Thank you for being part of the Alteryx family!
` : `
Action Required: Please process this order and ship the New Hire Bundle to the customer.

Shipping Notes: This order qualifies for free shipping. International orders may require additional customs documentation.
`}

© 2024 Alteryx, Inc. All rights reserved.
  `

  const mailOptions = {
    from: `"Alteryx Swag Portal" <${process.env.SMTP_USER}>`,
    to: to,
    subject: isAdminNotification ? 'New Order Notification - Alteryx New Hire Bundle' : 'Order Confirmation - Alteryx Swag',
    text: emailText,
    html: emailHtml,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Order confirmation email sent to:', to)
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}
