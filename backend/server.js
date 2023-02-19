const express = require("express");
const app = express();
const port = 8000; // 9000
const cors = require("cors");
app.use(cors());

// This will fire our mongoose.connect statement to initialize our database connection
require("./server/config/mongoose.config");

app.use(express.json(), express.urlencoded({ extended: true }));

// This is where we import the users routes function from our user.routes.js file
const AllMyUserRoutes = require("./server/routes/user.routes");
AllMyUserRoutes(app);
const AllMyJokesRoutes = require("./server/routes/jokes.routes");
AllMyJokesRoutes(app);
const AllMyPMRoutes = require("./server/routes/pm.routes");
AllMyPMRoutes(app);
const AllMyAuthorRoutes = require("./server/routes/author.routes");
AllMyAuthorRoutes(app);
const AllMyPirateRoutes = require("./server/routes/pirate.routes");
AllMyPirateRoutes(app);
// const AllMySmashedRoutes = require("./server/routes/smashed.routes");
// AllMySmashedRoutes(app);

app.get("/api", (req, res) => {
  console.log("trying to talk to database");
  res.json({ assignment: "Niemo Smashed", port: port });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
