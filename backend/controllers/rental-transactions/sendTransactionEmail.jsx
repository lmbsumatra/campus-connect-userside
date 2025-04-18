const transporter = require("../../config/nodemailer");

const sendTransactionEmail = async ({
  email,
  itemName,
  transactionType,
  amount,
  userName,
  recipientType,
  status,
}) => {
  let subject, message;

  switch (status) {
    case "Requested":
      if (recipientType === "owner") {
        subject = `New Request to ${
          transactionType === "sell" ? "Buy" : "Rent"
        } ${itemName}`;
        message = `Hello ${userName},<br><br>Someone has requested to ${
          transactionType === "sell" ? "buy" : "rent"
        } your item <strong>${itemName}</strong>. Please review the request and respond accordingly.`;
      } else {
        subject = `Request Sent for ${
          transactionType === "sell" ? "Buying" : "Renting"
        } ${itemName}`;
        message = `Hello ${userName},<br><br>Your request to ${
          transactionType === "sell" ? "buy" : "rent"
        } <strong>${itemName}</strong> has been sent to the owner. Please wait for their response.`;
      }
      break;

    case "Accepted":
      if (recipientType === "owner") {
        subject = `You've Accepted a ${
          transactionType === "sell" ? "Purchase" : "Rental"
        } Request`;
        message = `Hello ${userName},<br><br>You have accepted the ${
          transactionType === "sell" ? "purchase" : "rental"
        } request for your item <strong>${itemName}</strong>. The transaction is now in progress.`;
      } else {
        subject = `Your ${
          transactionType === "sell" ? "Purchase" : "Rental"
        } Request was Accepted`;
        message = `Hello ${userName},<br><br>Great news! Your ${
          transactionType === "sell" ? "purchase" : "rental"
        } request for <strong>${itemName}</strong> has been accepted by the owner. You can now proceed with the transaction.`;
      }
      break;

    case "Declined":
      subject = `${
        transactionType === "sell" ? "Purchase" : "Rental"
      } Request Declined`;
      message = `Hello ${userName},<br><br>We regret to inform you that your ${
        transactionType === "sell" ? "purchase" : "rental"
      } request for <strong>${itemName}</strong> has been declined by the owner.`;
      break;

    case "Cancelled":
      if (recipientType === "owner") {
        subject = `Transaction Cancelled - ${
          transactionType === "sell" ? "Sale" : "Rental"
        } of ${itemName}`;
        message = `Hello ${userName},<br><br>The ${
          transactionType === "sell" ? "sale" : "rental"
        } transaction for your item <strong>${itemName}</strong> has been cancelled by the requester.`;
      } else {
        subject = `${
          transactionType === "sell" ? "Purchase" : "Rental"
        } Request Cancelled`;
        message = `Hello ${userName},<br><br>Your ${
          transactionType === "sell" ? "purchase" : "rental"
        } request for <strong>${itemName}</strong> has been cancelled.`;
      }
      break;

    case "Handed Over":
      if (recipientType === "owner") {
        subject = `Item Handed Over - ${itemName}`;
        message = `Hello ${userName},<br><br>You have successfully handed over <strong>${itemName}</strong> to the ${
          transactionType === "sell" ? "buyer" : "renter"
        }.`;
      } else {
        subject = `Item Received - ${itemName}`;
        message = `Hello ${userName},<br><br>The owner has handed over <strong>${itemName}</strong> to you. Please proceed with the transaction as agreed.`;
      }
      break;

    case "Returned":
      if (recipientType === "owner") {
        subject = `Item Returned - ${itemName}`;
        message = `Hello ${userName},<br><br>The ${
          transactionType === "sell" ? "buyer" : "renter"
        } has returned <strong>${itemName}</strong> to you. Please confirm the completion of the transaction.`;
      } else {
        subject = `Item Successfully Returned - ${itemName}`;
        message = `Hello ${userName},<br><br>You have successfully returned <strong>${itemName}</strong> to the owner. Thank you for using RenTUPeers!`;
      }
      break;

    case "Completed":
      subject = `Transaction Completed - ${itemName}`;
      message =
        recipientType === "owner"
          ? `Hello ${userName},<br><br>The transaction for <strong>${itemName}</strong> has been completed successfully. Thank you for using RenTUPeers!`
          : `Hello ${userName},<br><br>Your transaction for <strong>${itemName}</strong> has been completed successfully. Thank you for using RenTUPeers!`;
      break;

    default:
      subject = `Transaction Update - ${itemName}`;
      message = `Hello ${userName},<br><br>Your transaction for <strong>${itemName}</strong> has been updated.`;
  }

  const mailOptions = {
    from: "jione.capstone@gmail.com",
    to: email,
    subject,
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject} - RenTUPeers</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f5;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background-color: #2b6cb0;
            color: #ffffff;
            padding: 20px 30px;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .header img {
            height: 40px;
          }
          .header-title {
            font-size: 20px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
            color: #2d3748;
          }
          .content h1 {
            font-size: 22px;
            margin-bottom: 20px;
            color: #1a202c;
          }
          .content p {
            font-size: 16px;
            margin-bottom: 16px;
            line-height: 1.6;
          }
          .amount {
            font-weight: 600;
            font-size: 18px;
            margin: 12px 0;
          }
          .button {
            display: inline-block;
            background-color: #3182ce;
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: 500;
          }
          .footer {
            background-color: #edf2f7;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #718096;
          }
          .footer a {
            color: #2b6cb0;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <img src="https://res.cloudinary.com/campusconnectcl/image/upload/v1735845626/cc/eazvmzm29uqxkk6vski3.png" alt="RenTUPeers Logo" />
            <div class="header-title">{"  "}RenTUPeers</div>
          </div>
          <div class="content">
            <h1>${subject}</h1>
            <p>${message}</p>
            <p class="amount">Amount: ₱${amount}</p>
            <a class="button" href="https://rentupeers.shop/profile/transactions/renter/requests" target="_blank">View Transaction</a>
            <p>If you have any questions, contact us at <a href="mailto:jione.capstone@gmail.com">rentupeers.team@tup.edu.ph</a>.</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} RenTUPeers · All rights reserved.
          </div>
        </div>
      </body>
    </html>`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendTransactionEmail;
