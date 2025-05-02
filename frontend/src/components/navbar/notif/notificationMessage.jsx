import React from "react";

const NotificationMessage = ({ message, type }) => {
  const getFormattedMessage = () => {
    switch (type) {
      case "rental_accepted": {
        const match = message.match(
          /(.*?)\shas accepted your rental request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">accepted</span> your rental
                request for {""}
              </span>
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="success-text">{message}</span>;
      }
      case "rental_declined": {
        const match = message.match(
          /(.*?)\shas declined your rental request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="error-text">declined</span> your rental
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="error-text">{message}</span>;
      }
      case "rental_cancelled": {
        const match = message.match(
          /(.*?)\shas cancelled the rental request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="error-text">cancelled</span> the rental
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="error-text">{message}</span>;
      }
      case "handover_confirmed": {
        const match = message.match(
          /(.*?)\shas confirmed (?:handover|receipt) of\s(.*?)\.?\s?(.*)/ // Made period optional
        );
        if (match) {
          const [, sender, item, action] = match;
          // Determine if it's handover or receipt based on message content if needed
          const confirmationType = message.includes("handover")
            ? "handover of"
            : "receipt of";
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">confirmed</span>{" "}
                {confirmationType}
              </span>
              <span className="item-name">{item}</span>
              {action &&
                action.trim() && ( // Check if action exists and isn't just whitespace
                  <>
                    <br />
                    <span className="item-name">{action.trim()}</span>
                  </>
                )}
            </>
          );
        }
        // Fallback for handover if regex doesn't match (e.g., older format)
        return (
          <>
            <span className="highlight-text">{message}</span>
            <br />
            <span className="action-text">Tap to confirm.</span>
          </>
        );
      }
      case "return_confirmed": {
        const match = message.match(
          /(.*?)\shas confirmed (?:receiving|return of)\s(.*?)(?:\.|\s|$)(.*)/
        );
        if (match) {
          const [, sender, item, action] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">confirmed</span> return of{" "}
                {""}
              </span>
              <span className="item-name">{item.trim()}</span>
              {action && action.trim() && (
                <>
                  <br />
                  <span className="action-text date-text">{action.trim()}</span>
                </>
              )}
            </>
          );
        }
        // // Fallback for return confirmation
        // return (
        //   <>
        //     <span className="highlight-text">{message}</span>
        //     <br />
        //     <span className="action-text">Tap to confirm.</span>
        //   </>
        // );
      }
      case "rental_completed": {
        const match = message.match(
          /Rental transaction with\s(.*?)\shas been completed/
        );
        if (match) {
          const [, partnerName] = match;
          return (
            <>
              <span className="font-large success-text">
                Rental Transaction Complete
              </span>
              <br />
              <span className="default-text"> with </span>
              <span className="item-name">{partnerName}</span>
            </>
          );
        }
        // Fallback if format slightly different
        return <span className="success-text">{message}</span>;
      }
      case "rental_request": {
        const match = message.match(/(.*?)\swants to rent\s(.*)/);
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">wants to rent</span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return message;
      }
      case "purchase_request": {
        const match = message.match(/(.*?)\swants to buy\s(.*)/);
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">wants to buy</span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return message;
      }
      case "purchase_accepted": {
        const match = message.match(
          /(.*?)\shas accepted your purchase request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">accepted</span> your purchase
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="success-text">{message}</span>;
      }
      case "purchase_receipt_confirmed": {
        // Adjusted regex to be more flexible
        const match = message.match(
          /(.*?)\s(?:has confirmed receipt of purchased item:|confirmed receipt of)\s(.*?)\.?$/
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="success-text">confirmed</span> receipt of
                purchased item:
              </span>
              <br />
              <span className="item-name">{item.trim()}</span>
            </>
          );
        }
        // Fallback for purchase confirmation
        return (
          <>
            <span className="highlight-text">{message}</span>
            <br />
            <span className="action-text">Tap to confirm.</span>
          </>
        );
      }
      case "purchase_declined": {
        const match = message.match(
          /(.*?)\shas declined your purchase request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="error-text">declined</span> your purchase
                request for
              </span>
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="error-text">{message}</span>;
      }
      case "purchase_cancelled": {
        const match = message.match(
          /(.*?)\shas cancelled the purchase request for\s(.*)\./
        );
        if (match) {
          const [, sender, item] = match;
          return (
            <>
              <span className="font-large">{sender}</span>
              <br />
              <span className="default-text">
                has <span className="error-text">cancelled</span> the purchase
                request for
              </span>
              <br />
              <span className="item-name">{item}</span>
            </>
          );
        }
        return <span className="error-text">{message}</span>;
      }
      case "purchase_completed": {
        // Check for buyer's message format
        let match = message.match(
          /Purchase of\s(.*?)\sfrom\s(.*?)\shas been completed/
        );
        let isBuyerPerspective = true;

        if (!match) {
          match = message.match(
            /Sale of\s(.*?)\sto\s(.*?)\shas been completed/
          );
          isBuyerPerspective = false;
        }

        if (match) {
          const [, item, partnerName] = match;
          return (
            <>
              <span className="font-large success-text">
                Purchase Transaction Complete
              </span>
              <br />
              <span className="default-text">
                {isBuyerPerspective
                  ? `for ${item.trim()} from `
                  : `for ${item.trim()} to `}
                <span className="item-name">{partnerName.trim()}</span>
              </span>
            </>
          );
        }
        return <span className="success-text">{message}</span>;
      }
      case "student_status": {
        if (message.includes("verified")) {
          return (
            <>
              <span className="font-large success-text">Account Verified</span>
              <br />
              <span className="default-text">{message}</span>
              <br />
              <span className="action-text">
                You now have full platform access.
              </span>
            </>
          );
        } else if (message.includes("flagged")) {
          return (
            <>
              <span className="font-large warning-text">Account Flagged</span>
              <br />
              <span className="default-text">{message}</span>
              <br />
              <span className="action-text">
                Contact support for more information.
              </span>
            </>
          );
        } else if (message.includes("banned")) {
          return (
            <>
              <span className="font-large error-text">Account Banned</span>
              <br />
              <span className="default-text">{message}</span>
              <br />
              <span className="action-text">
                Contact support if you believe this is an error.
              </span>
            </>
          );
        } else if (message.includes("restricted")) {
          return (
            <>
              <span className="font-large error-text">Account Restricted</span>
              <br />
              <span className="default-text">{message}</span>
              <br />
              <span className="action-text">
                Some features may be unavailable.
              </span>
            </>
          );
        } else if (message.includes("pending")) {
          return (
            <>
              <span className="font-large item-name">Verification Pending</span>
              <br />
              <span className="default-text">{message}</span>
              <br />
              <span className="action-text">Please wait for admin review.</span>
            </>
          );
        }
        return (
          <>
            <span className="item-name">Account Status Update</span>
            <br />
            <span className="default-text">{message}</span>
          </>
        );
      }
      case "listing_status": {
        if (message.includes("approved")) {
          return (
            <>
              <span className="font-medium success-text">{message}</span>
              <br />
              <span className="default-text">
                It's now live and visible to all.
              </span>
            </>
          );
        }
        // Handle other statuses (declined, removed etc.) if needed
        return <span className="font-medium">{message}</span>;
      }
      case "item_status": {
        if (message.includes("approved")) {
          return (
            <>
              <span className="font-medium success-text">{message}</span>
              <br />
              <span className="default-text">
                It's now live and visible to all.
              </span>
            </>
          );
        }
        // Handle other statuses (declined, removed etc.)
        else if (message.includes("declined") || message.includes("removed")) {
          return (
            <>
              <span className="font-medium error-text">{message}</span>
              <br />
              <span className="default-text">
                Check your item status for details.
              </span>
            </>
          );
        }
        return <span className="font-medium">{message}</span>; // Default display for item_status
      }
      case "new-item-for-sale": {
        // Assuming message contains the item name/description
        return (
          <>
            <span className="font-large">New Item Available</span>
            <br />
            <span className="item-name">{message}</span>
          </>
        );
      }
      case "post_status": {
        if (message.includes("approved")) {
          return (
            <>
              <span className="font-medium success-text">{message}</span>
              <br />
              <span className="default-text">
                It's now live and visible to all.
              </span>
            </>
          );
        } else if (
          message.includes("declined") ||
          message.includes("removed") ||
          message.includes("flagged")
        ) {
          return (
            <>
              <span className="font-medium error-text">{message}</span>
              <br />
              <span className="default-text">
                Check your post status for details.
              </span>
            </>
          );
        } else if (message.includes("reinstated")) {
          return (
            <>
              <span className="font-medium success-text">{message}</span>
              <br />
              <span className="default-text">
                Your post is now available again.
              </span>
            </>
          );
        }
        // Default case for other post statuses
        return (
          <>
            <span className="font-medium">{message}</span>
            <br />
            <span className="default-text">
              Check your post status for details.
            </span>
          </>
        );
      }
      case "transaction_report":
      case "transaction_report_response":
      case "report_resolved":
      case "report_escalated":
      case "admin_report_update": {
        return (
          <>
            <span className="font-large error-text">Report Notification</span>
            <br />
            <span className="default-text">{message}</span>
            <br />
            <span className="action-text">View details</span>
          </>
        );
      }
      case "new-listing": {
        return (
          <>
            <span className="font-large">New Listing Available</span>
            <br />
            <span className="item-name">{message}</span>
          </>
        );
      }
      case "new-post": {
        return (
          <>
            <span className="font-large">New Post Looking for:</span>
            <br />
            <span className="item-name">{message}</span>
            <br />
            <span className="action-text">Click to offer an item.</span>
          </>
        );
      }
      default:
        return message;
    }
  };

  return <div className="notification-message">{getFormattedMessage()}</div>;
};

export default NotificationMessage;
