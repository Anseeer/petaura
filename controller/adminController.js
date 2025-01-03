const User = require("../model/userSchema");
const Order = require("../model/orderSchema");
const mongoose = require("mongoose");
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
    console.log("error occures during the admin loadlogin !",error.message);
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
        console.log("error in admin-login");
        res.render("admin-login",{message:"Login Fail ,Please Try Again"});
    }
};
 

const loadDashboard = (req,res)=>{
    try {
        res.render("admin-dashboard");
    } catch (error) {
        console.log(error,"Faild to load home");
        res.render("admin-login",{message:"Please try again "});
    }
}

const logout = (req,res)=>{
    try{
        req.session.destroy((err)=>{
            if(err){
                console.log("Error in admin logout",err);
                res.status(500),send("error");
            }else{
                message = "Logout SuccessFull !";
                res.redirect('/admin/login');
            }
        })
    }catch(error){

        console.log("Error occures in admin logout ");
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
        const{filter,selectRange,startDate,endDate} = req.body;
        console.log("Body:",req.body)
        let start, end;
        const now = new Date();

        if (selectRange === "week") {
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            end = now;
        } else if (selectRange === "month") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (selectRange === "year") {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
        } else if(selectRange == "custom" && startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
            // Ensure full day range for custom dates
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
    
        }else{
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            end = now;
        }

        console.log("Start Date:", start, "End Date:", end);
        const order = await Order.aggregate([
            {
                $unwind: "$orderedItems"
            },
            {
                $match: {
                    "orderedItems.status": filter,
                    createdAT: { $gte: start, $lte: end }, // Ensure field name matches exactly
                }
            }
        ]);
        console.log("ORDER:",order)

        res.status(200).json({success:true,order});
    } catch (error) {
        console.error("Error in loadSalesReport:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// const loadSalesReportForCustomDate = async (req, res) => {
//     try {
//         const { startDate, endDate } = req.body;

//         // Validate request body
//         if (!startDate || !endDate) {
//             return res.status(400).json({ success: false, message: "Start and end dates are required" });
//         }

       
//         console.log("Start Date:", start, "End Date:", end);

//         const order = await Order.aggregate([
//             {
//                 $unwind: "$orderedItems"
//             },
//             {
//                 $match: {
//                     "orderedItems.status": "delivered",
//                     createdAT: { $gte: start, $lte: end },
//                 }
//             }
//         ]);

//         console.log("Order:", order);

//         // Render the sales report page with order data
//         res.status(200).render("salesReport", { order });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).send({ success: false, message: "Error loading sales report" });
//     }
// };



module.exports = {
    loadLogin,
    login,
    loadDashboard,
    logout,
    loadSalesReport,
    filterSalesReport
} 