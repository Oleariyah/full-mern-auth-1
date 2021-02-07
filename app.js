const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require("cors");
const morgan = require("morgan");
const authRouter = require("./routes/authRoutes");

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));
app.use(cors({}));

const dbURI = process.env.DBURI;
const PORT = process.env.PORT;

//dev configuration
if (process.env.NODE_ENV === "development") {
    app.use(cors({
        origin: process.env.CLIENT_URL
    }))

    app.use(morgan("dev"))
    //Morgan gives information about each request
    //cors allows the client url to access the server without block
}

//Load all routes
app.use("/api", authRouter);

app.use((req, res, next) => {
    res.status(404).json({
        message: "Page Not Found",
        success: false
    })
})

//connect to db
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then((results) => {
        app.listen(PORT, () => console.log(`listening to port ${PORT}`));
    })
    .catch((err) => console.error(err));