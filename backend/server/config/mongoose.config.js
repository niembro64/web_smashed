const mongoose = require('mongoose');

// Update the connection string from "localhost" to "127.0.0.1"
mongoose
  .connect('mongodb://127.0.0.1/smashed', {
    // Use 127.0.0.1 instead of localhost
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log('Established a connection to the Web Smashed Mongo DB')
  )
  .catch((err) =>
    console.log(
      'Something went wrong when connecting to the Web Smashed Mongo DB',
      err
    )
  );
