const mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost/assignment_exam", {
mongoose
  .connect('mongodb://localhost/smashed', {
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