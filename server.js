const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const votesFilePath = path.join(__dirname, 'votes.json');

app.use(express.static(__dirname));
app.use(express.json());

// Load votes from JSON file or start empty
let votes = {
  bestDress: {},
  bestPerformance: {}
};

function loadVotes() {
  try {
    if (fs.existsSync(votesFilePath)) {
      const data = fs.readFileSync(votesFilePath, 'utf-8');
      votes = JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load votes.json:', err);
  }
}

function saveVotes() {
  fs.writeFile(votesFilePath, JSON.stringify(votes, null, 2), err => {
    if (err) console.error('Failed to save votes.json:', err);
  });
}

loadVotes();

app.post('/vote', (req, res) => {
  const { category, contestant } = req.body;

  if (!category || !contestant) {
    return res.status(400).json({ error: 'Category and contestant required' });
  }

  if (!votes[category]) votes[category] = {};
  votes[category][contestant] = (votes[category][contestant] || 0) + 1;

  saveVotes();

  res.json({ success: true, votes: votes[category][contestant] });
});

app.get('/api/results', (req, res) => {
  res.json(votes);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
