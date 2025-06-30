const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let config = { limite_luz: 500 };

// GET para o Arduino buscar a config
app.get("/config", (req, res) => {
  res.json(config);
});

// POST para o app enviar nova config
app.post("/config", (req, res) => {
  const { limite_luz } = req.body;
  if (limite_luz !== undefined) {
    config.limite_luz = limite_luz;
    res.json({ status: "ok", config });
  } else {
    res.status(400).json({ error: "limite_luz ausente" });
  }
});

const PORT = 5002;
app.listen(PORT, () => console.log(`Controle rodando na porta ${PORT}`));
