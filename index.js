const express = require("express");
const app = express();
const path = require('path');
const env = require("dotenv").config();
const db = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const session = require("express-session");
const passport = require("./config/passport");
const nocache = require("nocache");
const fs = require('fs');

db();

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(nocache());
// app.use(express.static(path.join(__dirname, 'public')));  


// app.set('views',path.join(__dirname,'views'));
// app.set('view engine', 'ejs');
app.use(express.static('public'));
// View engine
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, 'views/user'), path.join(__dirname, 'views/admin')]);

app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use("/", userRoutes);
app.use("/admin", adminRoutes);

// Global error handler

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).render("error", {
        message: "Internal Server Error",
    });
});


// Start server
const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`
    Server is running on:
    User: http://localhost:${port}
    Admin: http://localhost:${port}/admin/login
    `);
});
