// backend/controllers/ReportController.js
const { models } = require("../models/index");
const Report = models.Report; // Import the Report model
// const Student = models.Student;

//  Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reporter_id, reported_entity_id, entity_type, reason } = req.body;

    // Validate inputs
    if (!reporter_id || !reported_entity_id || !entity_type || !reason) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (reason.length > 100) {
      return res
        .status(400)
        .json({ error: "Reason should not exceed 100 characters." });
    }

    // Check if the user has already reported this item
    const existingReport = await Report.findOne({
      where: {
        reporter_id,
        reported_entity_id,
      },
    });

    if (existingReport) {
      return res
        .status(400)
        .json({ error: "You have already reported this item." });
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
    //console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create report." });
  }
};

//Checking if user already reported the item

exports.checkReport = async (req, res) => {
  try {
    const { reporter_id, reported_entity_id } = req.query;

    // Validate inputs
    if (!reporter_id || !reported_entity_id) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingReport = await Report.findOne({
      where: {
        reporter_id,
        reported_entity_id,
      },
    });

    res.status(200).json({ hasReported: !!existingReport });
  } catch (error) {
    console.error("Error checking report:", error);
    res.status(500).json({ error: "Failed to check report." });
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
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    if (!reports.length) {
      return res.json([]); // no reports, no problem
    }

    const entityRefs = [
      ...new Set(
        reports.map((r) => `${r.entity_type}_${r.reported_entity_id}`)
      ),
    ];

    const names = await getBulkEntityNames(entityRefs);

    const reportsWithNames = reports.map((report) => ({
      ...report.toJSON(),
      entity_name:
        names[`${report.entity_type}_${report.reported_entity_id}`] ||
        report.reported_entity_id,
    }));

    res.json(reportsWithNames);
  } catch (error) {
    //console.error("Failed to fetch reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

const getBulkEntityNames = async (entityRefs) => {
  const result = {};

  // Group by entity type
  const grouped = entityRefs.reduce((acc, ref) => {
    const [type, id] = ref.split("_");
    if (!acc[type]) acc[type] = [];
    acc[type].push(id);
    return acc;
  }, {});

  // Initialize default values first
  entityRefs.forEach((ref) => {
    result[ref] = `[Deleted ${ref.split("_")[0]}]`; // Default value if not found
  });

  // Listings
  if (grouped.listing) {
    const listings = await models.Listing.findAll({
      where: { id: grouped.listing },
      attributes: ["id", "listing_name"],
    });
    listings.forEach((l) => {
      result[`listing_${l.id}`] = l.listing_name;
    });
  }

  // Posts
  if (grouped.post) {
    const posts = await models.Post.findAll({
      where: { id: grouped.post },
      attributes: ["id", "post_item_name"],
    });
    posts.forEach((p) => {
      result[`post_${p.id}`] = p.post_item_name;
    });
  }

  // Users
  if (grouped.user) {
    const users = await models.User.findAll({
      where: { user_id: grouped.user },
      attributes: ["user_id", "first_name", "last_name"],
    });
    users.forEach((u) => {
      result[`user_${u.user_id}`] = `${u.first_name} ${u.last_name}`;
    });
  }

  // Sales
  if (grouped.sale) {
    const sales = await models.ItemForSale.findAll({
      where: { id: grouped.sale },
      attributes: ["id", "item_for_sale_name"],
    });
    sales.forEach((s) => {
      result[`sale_${s.id}`] = s.item_for_sale_name;
    });
  }

  return result;
};

const DISMISSAL_THRESHOLD = 5;
// update report status and the entity status
exports.updateReportStatus = async (req, res) => {
  try {
    const {
      reportId,
      reportStatus,
      entityAction,
      statusMessage,
      lastUpdated,
      reviewedBy,
    } = req.body;

    // Find the report
    const report = await models.Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update the current report
    report.status = reportStatus;
    report.lastUpdated = lastUpdated || new Date().toISOString(); // Use provided timestamp or current time
    report.reviewedBy = reviewedBy; // Save the admin's full name
    await report.save();

    // Handle entity status changes
    if (reportStatus === "reviewed" && entityAction) {
      // Update the entity status (flagging, banning, etc.)
      if (report.entity_type === "user") {
        const student = await models.Student.findOne({
          where: { user_id: report.reported_entity_id },
        });
        if (student) {
          student.status = entityAction;
          student.status_message = statusMessage || "";
          await student.save();
        }
      } else {
        // Handle other entity types (posts, listings, etc.)
        let entityModel;
        switch (report.entity_type) {
          case "listing":
            entityModel = models.Listing;
            break;
          case "post":
            entityModel = models.Post;
            break;
          case "sale":
            entityModel = models.ItemForSale;
            break;
          default:
            return res.status(400).json({ error: "Invalid entity type." });
        }
        // Update entity status to "flagged"
        if (entityModel) {
          const entity = await entityModel.findByPk(report.reported_entity_id);
          if (entity) {
            entity.status = entityAction; // "flagged" or other action
            entity.status_message = statusMessage || "";
            await entity.save();
          } else {
            return res
              .status(404)
              .json({ error: "Reported entity not found." });
          }
        }
      }

      // Update all reports for the same entity to "resolved"
      await models.Report.update(
        {
          status: "reviewed",
          lastUpdated: lastUpdated || new Date().toISOString(),
          reviewedBy: reviewedBy,
        },
        {
          where: {
            reported_entity_id: report.reported_entity_id,
            entity_type: report.entity_type,
            status: "pending",
          },
        }
      );
    } else if (reportStatus === "dismissed") {
      // Count how many times this entity has been dismissed
      const dismissalCount = await models.Report.count({
        where: {
          reported_entity_id: report.reported_entity_id,
          entity_type: report.entity_type,
          status: "dismissed",
        },
      });

      // If reached threshold, dismiss all pending reports
      if (dismissalCount >= DISMISSAL_THRESHOLD) {
        await models.Report.update(
          {
            status: "dismissed",
            lastUpdated: lastUpdated || new Date().toISOString(),
            reviewedBy: reviewedBy,
          },
          {
            where: {
              reported_entity_id: report.reported_entity_id,
              entity_type: report.entity_type,
              status: "pending",
            },
          }
        );
      }
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ error: "Failed to update report status." });
  }
};

// Delete a report
// exports.deleteReport = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const report = await Report.findByPk(id);
//     if (!report) {
//       return res.status(404).json({ error: "Report not found." });
//     }

//     await report.destroy();
//     res.status(204).send();
//   } catch (error) {
//     // console.error("Error deleting report:", error);
//     res.status(500).json({ error: "Failed to delete report." });
//   }
// };

//Get the selected report Details
exports.getReportDetails = async (req, res) => {
  //console.log("Query Params:", req.query); // Debugging query params
  const { entity_type, entity_id } = req.query;
  //  // console.log("Entity Type:", entity_type);
  //  // console.log("Entity ID:", entity_id);

  if (!entity_type || !entity_id) {
    return res.status(400).json({ error: "Entity type and ID are required." });
  }

  try {
    let entityData;

    switch (entity_type) {
      case "listing":
        entityData = await models.Listing.findByPk(entity_id, {
          attributes: [
            "listing_name",
            "rate",
            "category",
            "delivery_mode",
            "late_charges",
            "specifications",
            "description",
            "tags",
            "created_at",
            "images",
          ],
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
          attributes: [
            "post_item_name",
            "category",
            "description",
            "specifications",
            "tags",
            "created_at",
            "images",
          ],
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
          attributes: ["first_name", "last_name", "middle_name", "email"],
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
          attributes: [
            "item_for_sale_name",
            "price",
            "category",
            "delivery_mode",
            "item_condition",
            "description",
            "specifications",
            "tags",
            "created_at",
            "images",
          ],
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
    // console.error("Error fetching entity data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
