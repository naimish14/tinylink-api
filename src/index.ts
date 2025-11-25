import "reflect-metadata";
import express from "express";
import cors from "cors";
import { createServer } from "http"; 
import { Server } from 'socket.io';
import { AppDataSource } from "./data-source";

import LinkRoutes from "./routes/link";

import { registerRoutes } from "./utils/registerRoutes";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.set('io', io);

const PORT = process.env.PORT || 3000;

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, version: "1.0" });
});

registerRoutes(app, LinkRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Connected to DB");

    httpServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`WebSocket server ready`);
    });
  })
  .catch((error) => {
    console.error("DB connection failed:", error);
  });