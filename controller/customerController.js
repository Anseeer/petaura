const User = require("../model/userSchema");
const bcrypt = require("bcrypt");

const loadCustomerList = async (req, res) => {
    try {
        let query = {};

        if (req.query.search && req.query.search.trim() !=="") {
            let searchTerm = req.query.search;
            query = {
                isAdmin: false, 
                $or: [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { email: { $regex: searchTerm, $options: "i" } },
                    { phone: { $regex: searchTerm, $options: "i" } }
                ]
            };
            
            const customer = await User.find(query);  // Corrected here
            res.render("customer-list", { customer });

        } else {
            const userData = await User.find({ isAdmin: 0 });
            res.render("customer-list", { customer: userData });
        }
    } catch (error) {
        console.log("loadCustomerList Failed");
        res.status(500).send("Error: " + error.message);  // Send error message
    }
};

const blockCustomer = async(req,res)=>{
    try {
        let id = req.query.id;
        if (!id) {
            console.error("Invalid ID received");
            return res.status(400).send("Invalid request. No ID provided.");
        }
        
        console.log("Recived ID:",id);
        
        await User.updateOne({_id:id},{$set:{isBlocked:true}});
        console.log("blocked")
        res.redirect("/admin/list-customer");
    } catch (error) {
        console.log("Error in blockCustomer",error)
        res.status(400).send("Error");
    }
}

const unblockCustomer = async(req,res)=>{
    try {
        let id = req.query.id;
        await User.updateOne({_id:id},{$set:{isBlocked:false}});
        console.log("unblocked")

        res.redirect("/admin/list-customer");
    } catch (error) {
        console.log("Error in unblockCustomer",error)
        res.status(400).send("Error");
    }
}

const deleteCustomer = async(req,res)=>{
    try {
     const id = req.query.id;
      await User.deleteOne({_id:id});
    res.redirect("/admin/list-customer")
    } catch (error) {
        console.log(error.message);
        res.status(400).send("Error occures in the deletCustomer");
    }
}


const loadAddCustomer = async(req,res)=>{
    try {
        res.render("add-customer");
    } catch (error) {
        res.status(400).send("Error in Add Customer");
        console.log("Error occures in addCustomer");
        
    }
}

const securepass = async (pass) => {
  try {
    const hashPass = await bcrypt.hash(pass, 10);
    return hashPass;
  } catch (error) {
    console.error("Error in securepass:", error.message);
    throw error; // Ensure the error propagates
  }
};

const addCustomer = async (req, res) => {
    try {
      const Customer = req.body;
      const Spassword = await securepass(req.body.password);
        console.log(Spassword);

      const existingCustomer = await  User.find({name:Customer.name, email:Customer.email });
      if(existingCustomer){
        res.status(500).send("Duplicate Customer");
        console.log("Duplicate Customer"); 
        
      }

      const customer = await  new User({
        name: req.body.name,
        password: Spassword,
        email: req.body.email,
        phone: req.body.phone,
      });
      
      const CustomerData = await customer.save();

      if (CustomerData) {
        const customer = await User.find({isAdmin:false});

        return res.render("customer-list", {customer});
      }else{
        console.log("error in add customer");
        res.render("error-page",{message:"ERROR in add new customer"});
      }
    } catch (error) {
      console.error("Error in addCustomer:", error.message);
      return res.status(500).render("error", { message: "Failed to add customer. Please try again later." });
    }
  };
  
module.exports = {
    loadCustomerList,
    blockCustomer,
    unblockCustomer,
    deleteCustomer,
    loadAddCustomer,
    addCustomer
}