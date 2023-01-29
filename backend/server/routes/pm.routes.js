const PMController = require("../controllers/pm.controller");

module.exports = (app) => {
  app.get("/api/pm/test", PMController.test);
  app.get("/api/pm/", PMController.findAllPM);
  app.get("/api/pm/:_id", PMController.findOneSinglePM);
  app.post("/api/pm/create", PMController.createNewPM);
  app.delete("/api/pm/delete/:_id", PMController.deleteAnExistingPM);
  app.patch("/api/pm/update/:_id", PMController.updateExistingPM);
};

