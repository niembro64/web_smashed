const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/assignment_exam", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.then(() => console.log("Established a connection to the assignment_exam DB"))
	.catch(err => console.log("Something went wrong when connecting to the assignment_exam DB", err));