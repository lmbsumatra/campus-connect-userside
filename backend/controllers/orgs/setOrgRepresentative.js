const { models } = require("../../models");

const setOrgRepresentative = async (req, res) => {
  const { orgId } = req.params; // Extract orgId from URL parameters
  const { rep_id } = req.body; // Extract rep_id from the request body

  console.log({ orgId, rep_id }); // Log the incoming request data

  try {
    // Find the organization by orgId
    const org = await models.Org.findByPk(orgId);

    if (!org) {
      console.error(`Organization with ID ${orgId} not found.`); // Log if org is not found
      return res.status(404).json({ error: "Organization not found" });
    }

    // If rep_id is null, remove the representative by setting user_id to null
    if (rep_id === null) {
      console.log(`Removing representative for organization ${orgId}`); // Log representative removal
      org.user_id = null;
    } else {
      // If rep_id is provided, validate if it exists in the users table
      const representative = await models.User.findByPk(rep_id);
      if (!representative) {
        console.error(`Representative with ID ${rep_id} not found.`); // Log if rep_id not found
        return res.status(404).json({ error: "Representative not found" });
      }

      // Set the representative for the organization
      console.log(`Setting representative for organization ${orgId} to user ${rep_id}`); // Log representative update
      org.user_id = rep_id;
    }

    await org.save(); // Save changes

    console.log(`Updated organization: ${JSON.stringify(org)}`); // Log the updated organization

    // Return the updated organization details
    res.json({
      message: "Organization representative updated successfully",
      org: {
        orgId: org.org_id,
        name: org.name,
        userId: org.user_id, // Use the updated user_id (could be null)
      },
    });
  } catch (err) {
    console.error(`Error occurred: ${err.message}`); // Log the error message
    res.status(500).json({ error: err.message });
  }
};

module.exports = setOrgRepresentative;
