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
        subject = `New Request to ${transactionType === "sell" ? "Buy" : "Rent"} ${itemName}`;
        message = `Hello ${userName},<br><br>Someone has requested to ${transactionType === "sell" ? "buy" : "rent"} your item <strong>${itemName}</strong>. Please review the request and respond accordingly.`;
      } else {
        subject = `Request Sent for ${transactionType === "sell" ? "Buying" : "Renting"} ${itemName}`;
        message = `Hello ${userName},<br><br>Your request to ${transactionType === "sell" ? "buy" : "rent"} <strong>${itemName}</strong> has been sent to the owner. Please wait for their response.`;
      }
      break;

    case "Accepted":
      if (recipientType === "owner") {
        subject = `You've Accepted a ${transactionType === "sell" ? "Purchase" : "Rental"} Request`;
        message = `Hello ${userName},<br><br>You have accepted the ${transactionType === "sell" ? "purchase" : "rental"} request for your item <strong>${itemName}</strong>. The transaction is now in progress.`;
      } else {
        subject = `Your ${transactionType === "sell" ? "Purchase" : "Rental"} Request was Accepted`;
        message = `Hello ${userName},<br><br>Great news! Your ${transactionType === "sell" ? "purchase" : "rental"} request for <strong>${itemName}</strong> has been accepted by the owner. You can now proceed with the transaction.`;
      }
      break;

    case "Declined":
      subject = `${transactionType === "sell" ? "Purchase" : "Rental"} Request Declined`;
      message = `Hello ${userName},<br><br>We regret to inform you that your ${transactionType === "sell" ? "purchase" : "rental"} request for <strong>${itemName}</strong> has been declined by the owner.`;
      break;

    case "Cancelled":
      if (recipientType === "owner") {
        subject = `Transaction Cancelled - ${transactionType === "sell" ? "Sale" : "Rental"} of ${itemName}`;
        message = `Hello ${userName},<br><br>The ${transactionType === "sell" ? "sale" : "rental"} transaction for your item <strong>${itemName}</strong> has been cancelled by the requester.`;
      } else {
        subject = `${transactionType === "sell" ? "Purchase" : "Rental"} Request Cancelled`;
        message = `Hello ${userName},<br><br>Your ${transactionType === "sell" ? "purchase" : "rental"} request for <strong>${itemName}</strong> has been cancelled.`;
      }
      break;

    case "Handed Over":
      if (recipientType === "owner") {
        subject = `Item Handed Over - ${itemName}`;
        message = `Hello ${userName},<br><br>You have successfully handed over <strong>${itemName}</strong> to the ${transactionType === "sell" ? "buyer" : "renter"}.`;
      } else {
        subject = `Item Received - ${itemName}`;
        message = `Hello ${userName},<br><br>The owner has handed over <strong>${itemName}</strong> to you. Please proceed with the transaction as agreed.`;
      }
      break;

    case "Returned":
      if (recipientType === "owner") {
        subject = `Item Returned - ${itemName}`;
        message = `Hello ${userName},<br><br>The ${transactionType === "sell" ? "buyer" : "renter"} has returned <strong>${itemName}</strong> to you. Please confirm the completion of the transaction.`;
      } else {
        subject = `Item Successfully Returned - ${itemName}`;
        message = `Hello ${userName},<br><br>You have successfully returned <strong>${itemName}</strong> to the owner. Thank you for using Campus Connect!`;
      }
      break;

    case "Completed":
      subject = `Transaction Completed - ${itemName}`;
      message = recipientType === "owner"
        ? `Hello ${userName},<br><br>The transaction for <strong>${itemName}</strong> has been completed successfully. Thank you for using Campus Connect!`
        : `Hello ${userName},<br><br>Your transaction for <strong>${itemName}</strong> has been completed successfully. Thank you for using Campus Connect!`;
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
        <title>${subject} - Campus Connect</title>
        <style>
          .container-content {
            padding: 40px;
            margin: 20px auto;
            border: 1px solid #e1e4e8;
            border-radius: 12px;
            background-color: white;
            max-width: 600px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            font-family: Arial, sans-serif;
          }
          .header {
            font-size: 24px;
            margin-bottom: 20px;
            color: #1a202c;
          }
          .details {
            font-size: 16px;
            color: #4a5568;
            line-height: 1.6;
          }
          .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="container-content">
          <h1 class="header">${subject}</h1>
          <p class="details">${message}</p>
          <p class="details">Amount: <strong>₱${amount}</strong></p>
          <p class="details">If you have any questions or concerns, please contact us at
            <a href="mailto:campusconnect@gmail.com">campusconnect@gmail.com</a>.
          </p>
          <p class="footer">Thank you for using Campus Connect!</p>
        </div>
      </body>
    </html>`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendTransactionEmail;
