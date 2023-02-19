const SmashedController = require('../controllers/smashed.controller');

module.exports = (app) => {
  app.get('/api/smashed/test', SmashedController.test);
  app.get('/api/smashed/', SmashedController.findAllSmashed);
  app.get('/api/smashed/:_id', SmashedController.findOneSingleSmashed);
  app.get(
    '/api/smashed/date/:momentCreated',
    SmashedController.findSmashedByDate
  );
  app.post('/api/smashed/create', SmashedController.createNewSmashed);
  app.delete(
    '/api/smashed/delete/:_id',
    SmashedController.deleteAnExistingSmashed
  );
  app.patch(
    '/api/smashed/update/:_id',
    SmashedController.updateExistingSmashed
  );
  app.patch(
    '/api/smashed/upsert/:momentCreated',
    SmashedController.upsertExistingSmashed
  );
};
