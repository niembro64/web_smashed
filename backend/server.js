const express = require('express');
const app = express();
const port = 8000; // 9000
const cors = require('cors');
app.use(cors());

// This will fire our mongoose.connect statement to initialize our database connection
require('./server/config/mongoose.config');

app.use(express.json(), express.urlencoded({ extended: true }));

const AllMySmashedRoutes = require('./server/routes/smashed.routes');
AllMySmashedRoutes(app);

app.get('/api', (req, res) => {
  console.log('trying to talk to database');
  res.json({ title: 'Niemo Smashed', port: port });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
