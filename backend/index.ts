import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { routes } from "./src/routes";
import { appConfig } from "./src/config/consts";
import { AppDataSource } from "./src/config/data-source";

const app = express();
const port = Number(appConfig.PORT) || 5000; // Use env port or default to 5000

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use("/api", routes);

// Basic health check route
app.get("/", (req: Request, res: Response) => {
  res.send("Backend çalışır");
});

// Initialize DataSource and start server
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`🚀 Backend server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database", error);
  });