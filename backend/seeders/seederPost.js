const { models } = require("../models");
const sequelize = require("../config/database");
const { faker } = require("@faker-js/faker");

// Function to generate random post data
const generateRandomPost = () => {
  const predefinedRenterIds = [51, 179];

  const generateTags = () => {
    return [faker.word.noun().toLowerCase()];
  };

  const generateSpecs = () => {
    const spec = faker.word.noun().toLowerCase();
    return { [spec]: spec };
  };

  return {
    renterId: predefinedRenterIds[Math.floor(Math.random() * predefinedRenterIds.length)],
    itemName: faker.commerce.productName().trim(),
    category: faker.commerce.department(),
    desc: faker.lorem.sentence(),
    tags: generateTags(),
    specs: generateSpecs(),
    images: Array.from({ length: 3 }, () => faker.image.url()),
    dates: Array.from({ length: 2 }, () => ({
      date: faker.date.future().toISOString().split("T")[0],
      durations: faker.helpers.arrayElement([
        [
          { timeFrom: "08:00", timeTo: "12:00" },
          { timeFrom: "14:00", timeTo: "18:00" },
        ],
        [{ timeFrom: "10:00", timeTo: "15:00" }],
      ]),
    })),
  };
};

// Seeder function to insert dummy post data
const seedPost = async () => {
    let transaction;
  
    try {
      transaction = await sequelize.transaction();
      const postData = generateRandomPost();
  
      // Create the post
      const post = await models.Post.create(
        {
          renter_id: postData.renterId,
          category: postData.category,
          post_item_name: postData.itemName,
          title: postData.itemName,
          description: postData.desc,
          tags: postData.tags,
          status: "approved",
          specifications: postData.specs,
          images: postData.images, // Store as an array, no stringify
        },
        { transaction }
      );
  
      // Process rental dates and durations
      const datePromises = postData.dates.map(async ({ date, durations }) => {
        const rentalDate = await models.Date.create(
          {
            item_id: post.id,
            date,
            item_type: "post",
          },
          { transaction }
        );
  
        const durationPromises = durations.map((time) =>
          models.Duration.create(
            {
              date_id: rentalDate.id,
              rental_time_from: time.timeFrom,
              rental_time_to: time.timeTo,
            },
            { transaction }
          )
        );
  
        await Promise.all(durationPromises);
        return rentalDate;
      });
  
      await Promise.all(datePromises);
  
      await transaction.commit();
      console.log(`Post created successfully with ID: ${post.id}`);
      return post;
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error creating post:", error);
      throw error;
    }
  };
  

// Run the seeder with proper error handling
const runSeeder = async () => {
  try {
    await seedPost();
    process.exit(0);
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exit(1);
  }
};

runSeeder();
