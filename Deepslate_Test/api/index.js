// index.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { parseNbt } = require('deepslate'); // vagy amit használsz a libből

const app = express();
const PORT = 3001;

app.get('/api/load', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data', 'example.nbt');
    const buffer = fs.readFileSync(filePath);

    const nbt = parseNbt(buffer);
    res.json(nbt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to parse NBT file' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
