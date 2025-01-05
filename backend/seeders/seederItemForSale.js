const { models } = require("../models");
const sequelize = require("../config/database");
const { faker } = require("@faker-js/faker");

// Function to generate a random item for sale
const generateRandomItemForSale = () => {
  const predefinedSellerIds = [51, 179];

  // Generate tags as an array of strings
  const generateTags = () => {
    return [faker.word.noun().toLowerCase()];
  };

  const generateSpecs = () => {
    const spec = faker.word.noun().toLowerCase();
    return { [spec]: spec };
  };

  return {
    sellerId:
      predefinedSellerIds[
        Math.floor(Math.random() * predefinedSellerIds.length)
      ],
    itemName: faker.commerce.productName().trim(),
    category: faker.commerce.department(),
    itemCondition: faker.helpers.arrayElement(["New", "Used", "Refurbished"]),
    paymentMethod: faker.helpers.arrayElement(["payment upon meetup", "Cash"]),
    price: parseFloat(faker.commerce.price()),
    desc: faker.lorem.sentence(),
    tags: generateTags(), // Now returns an array of strings
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
  };
};

// Seeder function to insert dummy data
const seedItemForSale = async () => {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    const itemData = generateRandomItemForSale();

    // Log the tags before creation to verify format
    console.log("Tags before creation:", itemData.tags);

    // Insert item for sale into database
    const item = await models.ItemForSale.create(
      {
        seller_id: itemData.sellerId,
        category: itemData.category,
        item_for_sale_name: itemData.itemName,
        item_condition: itemData.itemCondition,
        payment_mode: itemData.paymentMethod,
        price: itemData.price,
        images: JSON.stringify(itemData.images),
        description: itemData.desc,
        tags: itemData.tags, // JSON stringify the array
        status: "approved",
        specifications: itemData.specs,
      },
      { transaction }
    );

    // Process rental dates
    const datePromises = itemData.dates.map(async ({ date, durations }) => {
      const rentalDate = await models.Date.create(
        {
          item_id: item.id,
          date,
          item_type: "item_for_sale",
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
    await transaction.commit();

    console.log(`Item for sale created successfully with ID: ${item.id}`);
    return item;
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error creating item for sale:", error);
    throw error;
  }
};

// Run the seeder with proper error handling
const runSeeder = async () => {
  try {
    await seedItemForSale();
    process.exit(0);
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exit(1);
  }
};

runSeeder();
