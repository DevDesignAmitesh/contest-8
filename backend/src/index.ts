import express from "express";
import { handleChat } from "./routes/chat";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use(cors({
  origin: ["http://localhost:3000"]
}))

app.get("/", (req, res) => {
  res.send("OK")
});

app.get("/chat", handleChat);

app.listen(PORT, () => console.log(`code is running at ${PORT}`))
