import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.get("/", (req: Request, res: Response) => {
  res.send("Backend çalışır");
});

app.post("/api/login", (req: Request, res: Response) => {
  const { name, role, password } = req.body;

  if (role === "admin" && password === "admin") {
    res.json({ success: true, message: "Giriş uğurludur" });
  } else {
    res.status(401).json({ success: false, message: "Yanlış parol" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
