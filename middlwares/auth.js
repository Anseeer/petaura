const User = require("../model/userSchema");
const logger = require("../config/logger");
const userauth = (req, res, next) => {
    // Check for session user or Passport user
    const sessionUser = req.session.user ;

    if (sessionUser) {
        User.findById(sessionUser)
            .then(data => {
                if (data) {
                    if (data.isBlocked) {
                        logger.info("User is blocked");
                        req.session.destroy(err => {
                            if (err) {
                                logger.error("Error destroying session:", err);
                            }
                            res.redirect("/user/login");
                        });
                    } else {
                        req.user = data; // Attach user data to the request object
                        next(); // Proceed to the next middleware or route
                    }
                } else {
                    logger.info("User not found");
                    res.redirect("/user/login");
                }
            })
            .catch(err => {
                logger.error("Error occurred in userAuth:", err);
                res.redirect("/user/login");
            });
    } else {
        logger.info("No session");
        res.redirect("/user/login");
    }
};


const adminauth = async (req, res, next) => {
    try {
        const admin = req.session.admin;
        if (!admin) {
            console.log("No Admin Found");
            return res.redirect("/admin/login"); // Handle missing admin
        }
        next();
    } catch (err) {
        console.error("Error Finding Admin:", err);
        res.status(500).send("Internal Server Error");
    }
}


module.exports = {
    adminauth,
    userauth
}
 
