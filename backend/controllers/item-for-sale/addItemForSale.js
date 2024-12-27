const { models } = require("../../models");
const sequelize = require("../../config/database");

const validateItemData = (itemData) => {
  const requiredFields = ["sellerId", "itemName", "itemCondition", "paymentMethod", "price"];
  const missingFields = requiredFields.filter(field => !itemData[field]);
  
  if (missingFields.length) {
    throw new Error(`Required fields missing: ${missingFields.join(", ")}`);
  }
};

const validateImages = (files) => {
  if (!files?.length) {
    throw new Error("At least one image must be uploaded.");
  }
  return files.map(file => file.path);
};

const addItemForSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const itemData = typeof req.body.item === 'string' 
      ? JSON.parse(req.body.item) 
      : req.body.item;

    if (!itemData) {
      throw new Error("Item for sale data is missing");
    }

    validateItemData(itemData);
    const imageUrls = validateImages(req.files);

    const item = await models.ItemForSale.create({
      seller_id: itemData.sellerId,
      category: itemData.category,
      item_for_sale_name: itemData.itemName,
      item_condition: itemData.itemCondition,
      payment_mode: itemData.paymentMethod,
      price: itemData.price,
      images: JSON.stringify(imageUrls),
      description: itemData.desc,
      tags: JSON.stringify(itemData.tags),
      status: "pending",
      specifications: itemData.specs
    }, { transaction });

    if (Array.isArray(itemData.dates)) {
      for (const { date, timePeriods } of itemData.dates) {
        if (!date) throw new Error("Date is required in each date entry");
        
        const rentalDate = await models.Date.create({
          item_id: item.id,
          date,
          item_type: "item_for_sale"
        }, { transaction });

        if (!Array.isArray(timePeriods)) {
          throw new Error("Time periods must be provided as an array");
        }

        await Promise.all(timePeriods.map(period => {
          if (!period.startTime || !period.endTime) {
            throw new Error("Both start and end times are required");
          }

          return models.Duration.create({
            date_id: rentalDate.id,
            rental_time_from: period.startTime,
            rental_time_to: period.endTime
          }, { transaction });
        }));
      }
    }

    await transaction.commit();
    res.status(201).json({ message: "Item for sale created successfully.", item });

  } catch (error) {
    await transaction.rollback();
    
    if (req.files?.length) {
      const publicIds = req.files.map(file => file.filename);
      await rollbackUpload(publicIds);
    }

    res.status(400).json({
      error: "Validation Error",
      message: error.message
    });
  }
};

module.exports = addItemForSale;