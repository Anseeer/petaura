const User = require("../model/userSchema");
const Order = require("../model/orderSchema");
const Category = require("../model/categorySchema");
const Product = require("../model/productSchema");
const mongoose = require("mongoose");
const logger = require('../config/logger');
const bcrypt = require("bcrypt");

const loadLogin = async (req,res)=>{
   try {
    if(req.session.admin){
        res.redirect("/admin/dashboard");
    }
    res.render("admin-login");
   } catch (error) {
    res.render("error-page",{message:"ERROR ocuures during the admin loadlogin"});
    res.status(400);
    logger.error("error occures during the admin loadlogin !",error.message);
   }
}

const login = async(req,res)=>{
    try {
        const {email,password} = req.body ;
        const admin = await  User.findOne({email:email,isAdmin:true});
        if(admin){
            const checkPassword = await bcrypt.compare(password,admin.password);
            if(checkPassword){
                req.session.admin = admin;
                res.redirect("/admin/dashboard");
            }else{
                res.render("admin-login",{message:"Please check your password"});
            }
        }else{
            res.render("admin-login",{message:"Admin not found "});
        }
    } catch (error) {
        logger.error("error in admin-login");
        res.render("admin-login",{message:"Login Fail ,Please Try Again"});
    }
};
 

const loadDashboard = async(req,res)=>{
    try {
    let filterValue = req.query.filter || 'year';
    logger.debug(filterValue);
    let currentDate = new Date();
    let startDate, endDate;

if (filterValue === "year") {
    startDate = new Date(currentDate.getFullYear(), 0, 1); // January 1st of current year
    endDate = new Date(currentDate.getFullYear() + 1, 0, 1); // January 1st of next year
} else if (filterValue === "month") {
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of current month
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1); // First day of next month
}
        const product = await Product.find({}).sort({saleCount:-1}).limit(5);
        const category = await Category.find({}).sort({saleCount:-1}).limit(5);
        const users = await User.countDocuments({});
        logger.debug("start:",startDate,"end:",endDate);
        const totalSales = await Order.aggregate([
            {
                $match:{
                    "orderedItems.status":"delivered",
                    "createdAT":{
                        $gte:startDate,
                        $lte:endDate,
                    },
                },
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:"$finalPrice"},
                }
            }
        ]);

        let sales = totalSales.length > 0 ? totalSales[0].total : 0;
        logger.debug("totoalSales:",sales)

        const totalRevenue = await Order.aggregate([
            {
                $unwind: "$orderedItems", // Unwind the orderedItems array
            },
            {
                $match: {
                    "orderedItems.status": "delivered", // Filter for delivered items
                    "paymentStatus": "PAID",
                    "createdAT":{
                        $gte:startDate,
                        $lte:endDate,
                    },
                },
            },
            {
                $project: {
                    revenuePerItem: { $round: [{ $multiply: ["$orderedItems.totalPrice", 0.05] }, 2] },
                },
            },
            {
                $group: {
                    _id: null, // Aggregate into a single result
                    revenue: { $sum: "$revenuePerItem" }, // Sum the revenue
                },
            },
        ]);
        
        let revenue = totalRevenue.length > 0 ? totalRevenue[0].revenue : 0;
        logger.debug("Total Revenue (5)% of totalPrice):", revenue);
        
        
        

        res.render("admin-dashboard",{product,category,users,totalSales:sales,revenue});
    } catch (error) {
        logger.error(error,"Faild to load home");
        res.render("admin-login",{message:"Please try again "});
    }
}

const fetchDashboard = async(req,res)=>{
    try {
    let filterValue = req.query.filter || 'year';
    let start = req.query.start;
    let end = req.query.end;
    // console.log("Start:",start,"end:",end);
    // logger.info(filterValue);
    let currentDate = new Date();
    let startDate, endDate;

    if (start && end) {
        startDate = new Date(start);
            endDate = new Date(end);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(23, 59, 59, 999);
                                                                  
      } else {
        if (filterValue === "year") {
          startDate = new Date(currentDate.getFullYear(), 0, 1); // Jan 1st of current year
          endDate = new Date(currentDate.getFullYear() + 1, 0, 1); // Jan 1st of next year
        } else if (filterValue === "month") {
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of current month
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1); // First day of next month
        }
      }
  
      logger.info(`Date Range: Start = ${startDate}, End = ${endDate}`);
  

        const product = await Product.find({}).sort({saleCount:-1}).limit(5);
        const category = await Category.find({}).sort({saleCount:-1}).limit(5);
        const users = await User.countDocuments({ isAdmin: false });
        // logger.info(` 'start':,${startDate},'end:',${endDate}`);
        const totalSales = await Order.aggregate([
            {
                $match:{
                    "orderedItems.status":"delivered",
                    "createdAT":{
                        $gte:startDate,
                        $lte:endDate,
                    },
                },
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:"$finalPrice"},
                }
            }
        ]);

        let sales = totalSales.length > 0 ? totalSales[0].total : 0;
        // logger.info("totoalSales:",sales)

        const totalRevenue = await Order.aggregate([
            {
                $unwind: "$orderedItems", // Unwind the orderedItems array
            },
            {
                $match: {
                    "orderedItems.status": "delivered", // Filter for delivered items
                    "paymentStatus": "PAID",
                    "createdAT":{
                        $gte:startDate,
                        $lte:endDate,
                    },
                },
            },
            {
                $project: {
                    revenuePerItem: { $round: [{ $multiply: ["$orderedItems.totalPrice", 0.05] }, 2] },
                },
            },
            {
                $group: {
                    _id: null, // Aggregate into a single result
                    revenue: { $sum: "$revenuePerItem" }, // Sum the revenue
                },
            },
        ]);
        
        let revenue = totalRevenue.length > 0 ? totalRevenue[0].revenue : 0;
       

        res.status(200).json({product,category,users,totalSales:sales,revenue});
    } catch (error) {
        logger.error(error,"Faild to load home");
        res.render("admin-login",{message:"Please try again "});
    }
}

const logout = (req,res)=>{
    try{
        req.session.destroy((err)=>{
            if(err){
                logger.error("Error in admin logout",err);
                res.status(500),send("error");
            }else{
                message = "Logout SuccessFull !";
                res.redirect('/admin/login');
            }
        })
    }catch(error){

        logger.error("Error occures in admin logout ");
        res.status(500).send("error");
    }
};

const loadSalesReport = async (req, res) => {
    try {
      
        res.status(200).render("salesReport");

    } catch (error) {
        console.error("Error in loadSalesReport:", error);
        res.status(400).json({ success: false, message: "Error loading sales report." });
    }
};

const filterSalesReport = async (req, res) => {
    try {
        const { filter, selectRange, startDate, endDate } = req.body;
        logger.debug("Request Body:", req.body);

        let start, end;
        const now = new Date();

        // Determine date range based on selected option
        if (selectRange === "week") {
            logger.debug("Week")
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            end = now;
        } else if (selectRange === "month") {
            logger.debug("month")
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (selectRange === "year") {
            logger.debug("year")
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
        } else if (selectRange === "custom" && startDate && endDate) {
            logger.debug("custom")
            start = new Date(startDate);
            end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
        } else {
            logger.debug("default")
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            end = now;
        }

        logger.info("Start Date:", start, "End Date:", end);

        // Fetch orders based on date range and filter
        const order = await Order.aggregate([
            { $unwind: "$orderedItems" },
            {
                $match: {
                    "orderedItems.status": filter,
                    createdAT: { $gte: start, $lte: end }
                }
            },
            {
                $sort: { createdAT: -1 }
            }
        ]);

        logger.debug("Filtered Orders:", order);

        res.status(200).json({ success: true, order });
    } catch (error) {
        logger.error("Error in filterSalesReport:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


module.exports = {
    loadLogin,
    login,
    loadDashboard,
    fetchDashboard,
    logout,
    loadSalesReport,
    filterSalesReport
} 