// Import necessary models
const { models } = require("../../models/index");

// Controller function to add an item to the cart
exports.addCartItem = async (req, res) => {
    console.log("Request received to add item to cart:", req.body);  // Log the incoming request body

    try {
        const { user_id, owner_id, item_id, transaction_type, date, duration, price } = req.body;

        // Validate required fields
        if (!user_id || !owner_id || !item_id || !transaction_type || !date || !duration) {
            const missingFields = [
                !user_id && "user_id", 
                !owner_id && "owner_id", 
                !item_id && "item_id", 
                !transaction_type && "transaction_type", 
                !date && "date", 
                !duration && "duration"
            ].filter(Boolean);
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
        }

        // Create a new cart entry
        const newCartItem = await models.Cart.create({
            user_id,
            owner_id,
            item_id,
            transaction_type,
            date,
            duration,
            price,
            status: "pending", // Default status
        });

        return res.status(201).json({ message: "Item added to cart", data: newCartItem });
    } catch (error) {
        // Log the full error details to the console
        const errorResponse = {
            message: "Failed to add item to cart",
            error: error.message,  // Include error message in response for easier debugging
            errorDetails: error.errors || []  // Send detailed error messages from Sequelize (if any)
        };

        // Print the error response to console
        console.error("Error response:", JSON.stringify(errorResponse, null, 2)); // Pretty print for readability

        // Return the error response to the client
        return res.status(500).json(errorResponse);
    }
};
