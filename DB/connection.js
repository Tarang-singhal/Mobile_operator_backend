const mongoose = require("mongoose");

var DATABASEURL = process.env.DATABASEURL || "mongodb://localhost/adani_users";
mongoose.connect(DATABASEURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("DataBase Connected!");
}).catch(() => {
    console.log("DataBase not Connected!");
})