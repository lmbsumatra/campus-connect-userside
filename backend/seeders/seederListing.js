const { models } = require("../models");
const sequelize = require("../config/database");
const { faker } = require("@faker-js/faker");

// Function to generate random listing data
const generateRandomListing = () => {
  const predefinedOwnerIds = [19];

  const generateTags = () => {
    return [faker.word.noun().toLowerCase()];
  };

  const generateSpecs = () => {
    const spec = faker.word.noun().toLowerCase();
    return { [spec]: spec };
  };

  return {
    ownerId: predefinedOwnerIds[Math.floor(Math.random() * predefinedOwnerIds.length)],
    itemName: faker.commerce.productName().trim(),
    category: faker.commerce.department(),
    itemCondition: faker.helpers.arrayElement(["New", "Used", "Refurbished"]),
    paymentMethod: faker.helpers.arrayElement(["payment upon meetup", "gcash"]),
    price: parseFloat(faker.commerce.price()),
    desc: faker.lorem.sentence(),
    tags: generateTags(),
    specs: generateSpecs(),
    images: Array.from({ length: 2 }, () => faker.image.url()),
    dates: Array.from({ length: 2 }, () => ({
      date: faker.date.future().toISOString().split("T")[0],
      durations: faker.helpers.arrayElement([
        [
          { timeFrom: "08:00", timeTo: "12:00" },
          { timeFrom: "14:00", timeTo: "18:00" },
        ],
        [{ timeFrom: "09:00", timeTo: "11:00" }],
      ]),
    })),
    lateCharges: parseFloat(faker.commerce.price(10, 50)),
    securityDeposit: parseFloat(faker.commerce.price(100, 500)),
    repairReplacement: faker.lorem.sentence(),
  };
};

// Seeder function to insert dummy listing data
const seedListing = async () => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const listingData = generateRandomListing();

    // Create the listing
    const listing = await models.Listing.create(
      {
        owner_id: listingData.ownerId,
        category: listingData.category,
        listing_name: listingData.itemName,
        listing_condition: listingData.itemCondition,
        payment_mode: listingData.paymentMethod,
        rate: listingData.price,
        images: JSON.stringify(listingData.images),
        description: listingData.desc,
        tags: listingData.tags,
        status: "approved",
        specifications: listingData.specs,
        late_charges: listingData.lateCharges,
        security_deposit: listingData.securityDeposit,
        repair_replacement: listingData.repairReplacement,
      },
      { transaction }
    );

    // Process rental dates and durations
    const datePromises = listingData.dates.map(async ({ date, durations }) => {
      const rentalDate = await models.Date.create(
        {
          item_id: listing.id,
          date,
          item_type: "listing",
        },
        { transaction }
      );

      const durationPromises = durations.map((period) =>
        models.Duration.create(
          {
            date_id: rentalDate.id,
            rental_time_from: period.timeFrom,
            rental_time_to: period.timeTo,
          },
          { transaction }
        )
      );

      await Promise.all(durationPromises);
      return rentalDate;
    });

    await Promise.all(datePromises);

    // Create notification for the new listing
    const owner = await models.User.findOne({
      where: { user_id: listing.owner_id },
      attributes: ["user_id", "first_name", "last_name"],
    });

    const ownerName = owner
      ? `${owner.first_name} ${owner.last_name}`
      : "Unknown";

    await models.Notification.create(
      {
        type: "new-listing",
        title: "New Listing awaiting approval",
        message: `${ownerName} created a new listing: "${listing.listing_name}"`,
        ownerName,
        ownerId: owner.user_id,
        itemId: listing.id,
        itemType: "listing",
        timestamp: new Date(),
        isRead: false,
      },
      { transaction }
    );

    await transaction.commit();
    console.log(`Listing created successfully with ID: ${listing.id}`);
    return listing;
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error creating listing:", error);
    throw error;
  }
};

// Run the seeder with proper error handling
const runSeeder = async () => {
  try {
    await seedListing();
    process.exit(0);
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exit(1);
  }
};

runSeeder();