const path = require("path");
const fs = require("fs");
const { models } = require("../../models");

// This function assumes that the middleware handling the file upload has already been run
const uploadEvidenceImage = async (req, res, emitNotification) => {
  // Ensure that the file was uploaded
  if (!req.file) {
    console.error("No file uploaded. req.file is undefined.");
    return res.status(400).json({ error: "No file uploaded." });
  }

  const { transactionId, evidenceType, userId } = req.body;

  console.log(req.body, req.file.path);

  try {
    // Find the transaction
    const transaction = await models.RentalTransaction.findByPk(transactionId);
    if (!transaction) {
      console.error(`Transaction with ID ${transactionId} not found.`);
      return res.status(404).json({ error: "Transaction not found." });
    }

    // Authorization check to ensure the user is either the owner, renter, or buyer of the transaction
    if (
      ![
        transaction.owner_id,
        transaction.renter_id,
        transaction.buyer_id,
      ].includes(parseInt(userId))
    ) {
      console.error(
        `User with ID ${userId} is unauthorized to upload evidence for transaction ${transactionId}.`
      );
      return res.status(403).json({ error: "Unauthorized user." });
    }

    let evidenceColumn;
    switch (evidenceType) {
      case "rental-handover-evidence":
        evidenceColumn = "handover_proof";
        break;
      case "rental-return-evidence":
        evidenceColumn = "return_proof";
        break;
      case "purchase-handover-evidence":
        evidenceColumn = "sale_completion_proof";
        break;
      default:
        console.error(`Invalid evidence type: ${evidenceType}`);
        return res.status(400).json({ error: "Invalid evidence type." });
    }

    // Construct the file path to store in the database
    const filePath = req.file.path;

    // Update the appropriate column in the transaction with the file path
    transaction[evidenceColumn] = filePath;
    console.log(transaction, transaction.evidenceColumn);

    // Attempt to save the updated transaction
    try {
      await transaction.save();
    } catch (dbSaveError) {
      console.error("Error saving transaction:", dbSaveError);
      return res
        .status(500)
        .json({ error: "Error saving transaction to database." });
    }

    // Send the response with a success message
    return res.status(200).json({
      message: "Evidence uploaded successfully.",
      filePath,
      evidenceType,
    });
  } catch (error) {
    // Catching and logging the error to provide more detail
    console.error("UploadEvidence error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadEvidenceImage };
