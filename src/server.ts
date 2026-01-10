import express from "express";
import cors from "cors";
import { json } from "body-parser";
import routes from "./routes/index";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(json());

// Routes
app.use("/api", routes);

// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start DB & Server
import { connectDB } from "./db/conn";

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});

