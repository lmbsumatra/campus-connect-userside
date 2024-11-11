const { Server } = require("socket.io");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  const adminSockets = new Set();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Track admin connections
    socket.on("admin-connect", () => {
      adminSockets.add(socket.id);
      console.log("Admin connected. Current admin sockets:", Array.from(adminSockets));
    });

    // Handle listing notifications
    socket.on("new-listing", (notification) => {
      console.log("Received new listing notification:", notification);
      console.log("Current admin sockets when receiving listing:", Array.from(adminSockets));
      notifyAdmins(notification);
    });

    // Handle item-for-sale notifications
    socket.on("new-item-for-sale", (notification) => {
      console.log("Received new item-for-sale notification:", notification);
      console.log("Current admin sockets when receiving item-for-sale:", Array.from(adminSockets));
      notifyAdmins(notification);
    });

    // Handle post notifications (new addition)
    socket.on("new-post", (notification) => {
      console.log("Received new post notification:", notification);
      console.log("Current admin sockets when receiving post:", Array.from(adminSockets));
      notifyAdmins(notification);
    });

    // Clean up on disconnect
    socket.on("disconnect", () => {
      adminSockets.delete(socket.id);
      console.log("Client disconnected. Remaining admin sockets:", Array.from(adminSockets));
    });
  });

  // Function to notify all connected admins
  const notifyAdmins = (notification) => {
    console.log("Sending notification to admins:", notification);
    console.log("Number of admin sockets:", adminSockets.size);
    
    const eventName = notification.type === "new-item-for-sale"
      ? "new-item-for-sale-notification"
      : notification.type === "new-post"
      ? "new-post-notification" // Event for new posts
      : "new-listing-notification"; // Default to listing notification
  
    // Emit notification to all connected admins
    adminSockets.forEach(socketId => {
      console.log(`Emitting ${eventName} to socket ${socketId}`);
      io.to(socketId).emit(eventName, notification);
    });
  };

  return { io, notifyAdmins };
}

module.exports = { initializeSocket };
