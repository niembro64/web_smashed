const PirateController = require("../controllers/pirate.controller");

module.exports = (app) => {
  app.get("/api/pirate/test", PirateController.test);
  app.get("/api/pirate/", PirateController.findAllPirate);
  app.get("/api/pirate/:_id", PirateController.findOneSinglePirate);
  app.post("/api/pirate/create", PirateController.createNewPirate);
  app.delete("/api/pirate/delete/:_id", PirateController.deleteAnExistingPirate);
  app.patch("/api/pirate/update/:_id", PirateController.updateExistingPirate);
};
