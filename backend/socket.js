const { Server } = require("socket.io");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Adjust this in production
      methods: ["GET", "POST"]
    }
  });

  const adminSockets = new Set();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Track admin connections
    socket.on("admin-connect", () => {
      adminSockets.add(socket.id);
      console.log("Admin connected:", socket.id);
    });

    // Clean up on disconnect
    socket.on("disconnect", () => {
      adminSockets.delete(socket.id);
      console.log("Client disconnected:", socket.id);
    });
  });

  // Function to notify all connected admins of a new listing
  const notifyAdmins = (notification) => {
    console.log("Sending notification to admins:", notification); 
    adminSockets.forEach(socketId => {
      try {
        io.to(socketId).emit("new-listing-notification", notification);
      } catch (error) {
        console.error("Error notifying admin:", socketId, error);
      }
    });
  };

  return { io, notifyAdmins };
}

module.exports = { initializeSocket };
