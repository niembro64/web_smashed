const AuthorController = require("../controllers/author.controller");

module.exports = (app) => {
  app.get("/api/author/test", AuthorController.test);
  app.get("/api/author/", AuthorController.findAllAuthor);
  app.get("/api/author/:_id", AuthorController.findOneSingleAuthor);
  app.post("/api/author/create", AuthorController.createNewAuthor);
  app.delete("/api/author/delete/:_id", AuthorController.deleteAnExistingAuthor);
  app.patch("/api/author/update/:_id", AuthorController.updateExistingAuthor);
};

// test