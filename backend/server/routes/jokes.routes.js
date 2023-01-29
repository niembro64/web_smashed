const JokesController = require("../controllers/jokes.controller");

module.exports = (app) => {
  app.get("/api/test", JokesController.test);
  app.get("/api/jokes/", JokesController.findAllJokes);
  app.get("/api/jokes/:_id", JokesController.findOneSingleJoke);
  app.post("/api/jokes/create", JokesController.createNewJoke);
  app.delete("/api/jokes/delete/:_id", JokesController.deleteAnExistingJoke);
  app.patch("/api/jokes/update/:_id", JokesController.updateExistingJoke);
};

