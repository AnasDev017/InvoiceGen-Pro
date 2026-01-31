import express from "express";
import { configDotenv } from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import clientsRoutes from "./routes/clientsRoutes.js";
import generateInvoiceRoutes from "./routes/generateInvoiceRoutes.js";
import servicesRoutes from "./routes/serviesRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

configDotenv();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

connectDB();

app.use("/auth", authRoutes);
app.use(clientsRoutes);
app.use(generateInvoiceRoutes);
app.use(servicesRoutes);
app.use(analyticsRoutes);

export default app;
