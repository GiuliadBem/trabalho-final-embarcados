const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let logs = [];

// GET para retornar o histórico
app.get("/log", (req, res) => {
  res.json(logs);
});

// POST para receber dados do sensor
app.post("/log", (req, res) => {
  const { valor_luz, timestamp } = req.body;
  if (valor_luz !== undefined && timestamp !== undefined) {
    logs.push({ valor_luz, timestamp });
    res.json({ status: "ok" });
  } else {
    res.status(400).json({ error: "Dados ausentes" });
  }
});

const PORT = 5003;
app.listen(PORT, () => console.log(`Logging rodando na porta ${PORT}`));
