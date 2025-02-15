// backend/controllers/ReportController.js
const { models } = require("../models/index");
const Report = models.Report; // Import the Report model

//  Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reporter_id, reported_entity_id, entity_type, reason } = req.body;

    // Validate inputs
    if (!reporter_id || !reported_entity_id || !entity_type || !reason) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Create a new report
    const newReport = await Report.create({
      reporter_id,
      reported_entity_id,
      entity_type,
      reason,
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create report." });
  }
};

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        {
          model: models.User,
          as: "reporter", 
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports." });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status input
    const validStatuses = ["pending", "reviewed", "flagged", "dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    // Find the report
    const report = await Report.findByPk(id);
    if (!report) {
      console.error("Report not found:", id);
      return res.status(404).json({ error: "Report not found." });
    }

    // Update the report status
    report.status = status;
    await report.save();

    // If the report status is "flagged", update the entity status
    if (status === "flagged") {
      const { reported_entity_id, entity_type } = report;

      let entityModel;
      switch (entity_type) {
        case "listing":
          entityModel = models.Listing;
          break;
        case "post":
          entityModel = models.Post;
          break;
        case "sale":
          entityModel = models.ItemForSale;
          break;
        case "user":
          entityModel = models.User;
          break;
        default:
          console.error("Unsupported entity type:", entity_type);
          return res.status(400).json({ error: "Invalid entity type." });
      }

      // Find and update the entity
      const entity = await entityModel.findByPk(reported_entity_id);
      if (entity) {
        if (entity.status !== undefined) {
          entity.status = "flagged"; // Ensure the entity has a status column
          await entity.save();
        } else {
          console.warn("Entity does not have a 'status' field:", entity_type);
        }
      } else {
        console.error("Reported entity not found:", reported_entity_id);
        return res.status(404).json({ error: "Reported entity not found." });
      }
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ error: "Failed to update report status." });
  }
};



// Delete a report
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }

    await report.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ error: "Failed to delete report." });
  }
};

//Get the selected report Details
exports.getReportDetails = async (req, res) => {
  // console.log("Query Params:", req.query); // Debugging query params
  const { entity_type, entity_id } = req.query;
  //  console.log("Entity Type:", entity_type);
  //  console.log("Entity ID:", entity_id);

  if (!entity_type || !entity_id) {
    return res.status(400).json({ error: "Entity type and ID are required." });
  }

  try {
    let entityData;

    switch (entity_type) {
      case "listing":
        entityData = await models.Listing.findByPk(entity_id, {
          attributes: ["listing_name", "rate", "category","delivery_mode","late_charges","specifications","description","tags","created_at","images"],
          include: [
            {
              model: models.User,
              as: "owner", 
              attributes: ["first_name", "last_name"], 
            },
          ],
        });
        break;
        case "post":
          entityData = await models.Post.findByPk(entity_id, {
            attributes: ["post_item_name", "category", "description","specifications", "tags", "created_at","images"],
            include: [
              {
                model: models.User,
                as: "renter", 
                attributes: ["first_name", "last_name"], 
              },
            ],
          });
          break;
      case "user":
        entityData = await models.User.findByPk(entity_id, {
          attributes: ["first_name", "last_name","middle_name", "email"],
          include: [
            {
              model: models.Student,
              as: "student", 
              attributes: ["tup_id", "college", "profile_pic"], 
            },
          ],
        });
        break;
      case "sale":
        entityData = await models.ItemForSale.findByPk(entity_id, {
          attributes: ["item_for_sale_name", "price", "category","delivery_mode", "item_condition","description","specifications", "tags", "created_at","images"],
          include: [
            {
              model: models.User,
              as: "seller", 
              attributes: ["first_name", "last_name"], 
            },
          ],
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid entity type." });
    }

    if (!entityData) {
      return res.status(404).json({ error: "Entity not found." });
    }

    res.status(200).json(entityData);
  } catch (error) {
    console.error("Error fetching entity data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};