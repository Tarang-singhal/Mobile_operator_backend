const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const io = require("socket.io");
const {
  userConnected,
  userDisconnected,
} = require("./controllers/userController");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./.env.local" });

mongoose
  .connect(process.env.DATABASEURL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful!"));


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const ioSocket = io(server, {
  cors: {
    origin: process.env.APP_URL,
  },
});

ioSocket.on("connection", (socket) => {
  console.log("user Connected!");
  socket.on("connected", async (data) => {
    // console.log("🚀 ~ file: server.js ~ line 35 ~ socket.on ~ data", {
    //   data: { ...data, socketId: socket.id },
    // });
    data.user.socketId = socket.id;
    await userConnected(data.user);
  });
  socket.on("disconnect", async (reason) => {
    console.log("🚀 ~ file: server.js ~ line 35 ~ socket.on ~ userId", {
      reason,
      id: socket.id,
    });
    await userDisconnected(socket.id);
    // console.log("user Disconnected!");
  });
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  // console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
