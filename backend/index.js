import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import loanRoutes from "./routes/loans.js";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import branchRoutes from "./routes/branches.js";
import copyRoutes from "./routes/copies.js";
import eventRoutes from "./routes/events.js";
import holdRoutes from "./routes/holds.js";
import metricRoutes from "./routes/metric.js";   
import patronRoutes from "./routes/patrons.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/loans", loanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/copies", copyRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/holds", holdRoutes);
app.use("/api/staff/metrics", metricRoutes);    
app.use("/api/patrons", patronRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Backend running on port", process.env.PORT || 3000);
});
