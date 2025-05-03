const transporter = require("./nodemailer");

const sendAdminNotificationEmail = async ({
  actionType,
  userName,
  itemName,
  reportId,
  reportType,
  reportReason,
  userEmail,
  userId,
  orgName,
  adminAction,
  details,
  timestamp,
}) => {
  const adminEmail = "jione.capstone@gmail.com";
  let subject, message, actionUrl;

  // Determine appropriate subject, message and action URL based on action type
  switch (actionType) {
    case "user_verification":
      subject = `User Verification Required - ${userName}`;
      message = `A new user verification request requires your attention. User <strong>${userName}</strong> has uploaded verification documents that need to be reviewed.`;
      actionUrl = `/admin`;
      break;

    case "item_approval":
      subject = `Item Approval Required - ${itemName}`;
      message = `User has submitted a new item listing <strong>${itemName}</strong> that requires approval before it can be published on the platform.`;
      actionUrl = `/admin`;
      break;

    case "post_approval":
      subject = `Post Approval Required - ${itemName}`;
      message = `User has submitted a new post that requires approval before it can be published on the platform.`;
      actionUrl = `/admin`;
      break;

    case "user_report":
      subject = `User Report #${reportId} - Action Required`;
      message = `A user report has been filed against <strong>${userName}</strong>. Report reason: <strong>${reportReason}</strong>. This report requires your immediate attention.`;
      actionUrl = `/admin`;
      break;

    case "item_report":
      subject = `Item Report #${reportId} - Action Required`;
      message = `A report has been filed for item <strong>${itemName}</strong>. Report reason: <strong>${reportReason}</strong>. This report requires your immediate attention.`;
      actionUrl = `/admin`;
      break;

    case "post_report":
      subject = `Post Report #${reportId} - Action Required`;
      message = `A report has been filed for a post by <strong>${userName}</strong>. Report reason: <strong>${reportReason}</strong>. This report requires your immediate attention.`;
      actionUrl = `/admin`;
      break;

    case "transaction_dispute":
      subject = `Transaction Dispute - Action Required`;
      message = `A dispute has been raised for a transaction involving item <strong>${itemName}</strong>. Please review the transaction details and help resolve the issue.`;
      actionUrl = `/admin`;
      break;

    case "org_approval":
      subject = `Organization Approval Request - ${orgName}`;
      message = `A new organization <strong>${orgName}</strong> has been created by <strong>${userName}</strong> and requires your approval.`;
      actionUrl = `/admin`;
      break;

    case "slot_purchase":
      subject = `New Slot Purchase - ${userName}`;
      message = `User <strong>${userName}</strong> has purchased a new slot. Please verify the payment and approve the slot allocation.`;
      actionUrl = `/admin`;
      break;

    case "system_alert":
      subject = `System Alert - Immediate Action Required`;
      message = `A system alert has been triggered: <strong>${details}</strong>. This requires immediate investigation.`;
      actionUrl = `/admin`;
      break;

    default:
      subject = `Admin Notification - Action Required`;
      message = `There is a new notification that requires your attention: <strong>${details || "No details provided"}</strong>.`;
      actionUrl = `/admin`;
  }

  // Add admin action tracking if provided
  if (adminAction) {
    message += `<br><br>Previous admin action: <strong>${adminAction}</strong> on ${timestamp}.`;
  }

  const mailOptions = {
    from: "jione.capstone@gmail.com",
    to: adminEmail,
    subject,
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject} - RenTUPeers Admin</title>
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
            background-color: #1a202c;
            color: #ffffff;
            padding: 20px 30px;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .header img {
            height: 40px;
            margin-right: 16px;
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
          .priority-indicator {
            background-color: #e53e3e;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 20px;
            font-weight: 500;
          }
          .details-section {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .details-row {
            display: flex;
            border-bottom: 1px solid #edf2f7;
            padding: 8px 0;
          }
          .details-row:last-child {
            border-bottom: none;
          }
          .details-label {
            font-weight: 600;
            width: 140px;
            color: #4a5568;
          }
          .details-value {
            flex: 1;
          }
          .button {
            display: inline-block;
            background-color: #e53e3e;
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
          .timestamp {
            font-size: 14px;
            color: #718096;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <img src="https://res.cloudinary.com/campusconnectcl/image/upload/v1735845626/cc/eazvmzm29uqxkk6vski3.png" alt="RenTUPeers Logo" />
            <div class="header-title">RenTUPeers Admin Portal</div>
          </div>
          <div class="content">
            <h1>${subject}</h1>
            <div class="priority-indicator">Requires Immediate Attention</div>
            <p>${message}</p>
            
            <div class="details-section">
              ${userName ? `
              <div class="details-row">
                <div class="details-label">User:</div>
                <div class="details-value">${userName}</div>
              </div>` : ''}
              
              ${userEmail ? `
              <div class="details-row">
                <div class="details-label">Email:</div>
                <div class="details-value">${userEmail}</div>
              </div>` : ''}
              
              ${itemName ? `
              <div class="details-row">
                <div class="details-label">Item:</div>
                <div class="details-value">${itemName}</div>
              </div>` : ''}
              
              ${reportReason ? `
              <div class="details-row">
                <div class="details-label">Report Reason:</div>
                <div class="details-value">${reportReason}</div>
              </div>` : ''}
              
              ${details ? `
              <div class="details-row">
                <div class="details-label">Details:</div>
                <div class="details-value">${details}</div>
              </div>` : ''}
              
              <div class="details-row">
                <div class="details-label">Timestamp:</div>
                <div class="details-value">${timestamp || new Date().toLocaleString()}</div>
              </div>
            </div>
            
            <a class="button" href="https://rentupeers.shop${actionUrl}" target="_blank">Take Action Now</a>
            
            <p>This is an automated message. Please do not reply to this email.</p>
            
            <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} RenTUPeers · Admin Portal · All rights reserved.
          </div>
        </div>
      </body>
    </html>`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendAdminNotificationEmail;