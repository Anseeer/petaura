const User = require("../model/userSchema");
const Address = require("../model/addressSchema");
const Order = require("../model/orderSchema");
const Product = require("../model/productSchema");
const Referral = require("../model/referralSchema");
const nodemailer = require("nodemailer");
const env=require("dotenv").config();
const bcrypt  = require("bcrypt");
const { text } = require("express");




function generateOtp() {
    // Generate a random number between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000);
  }

 
async function sendVerificationEmail(email,otp){
    try {
        if (!email || email.length === 0) {
            throw new Error("Invalid email provided");
        }

        const transporter = nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        });

        const  info = await  transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"verify your account!",
            text:`your OTP is ${otp}`,
            html:`<p>your OTP is :${otp} </p>`
        });

        return info.accepted.length > 0 ;

    } catch (error) {
        console.log("ERROR SENDING EMAIL ",error);
        res.status(400).render("error",{message:"ERROR SENDING EMAIL "});
        return false;
    }
}

const loadForgetEmail = async(req,res)=>{
    try {
        console.log("load ForgetEmail Page ")
        res.render("forgetPass-email");
    } catch (error) {
        res.json({success:false,message:"ERROR in load forgetEMail"});
        console.log("error occurece in the load fogetpasss-email ");
        
    }
}

const verifyEmail= async(req,res)=>{
    try {
        const {email} = req.body;
        
        const findUser = await User.findOne({email:email});
        if(findUser){
            console.log("Find the user");
            const otp= await  generateOtp();
            const sentMail = await sendVerificationEmail(email,otp);
            if(sentMail){
                req.session.userOtp = otp;
                req.session.email=email;
                console.log("The OTP for ResetPassword :",otp);

                res.render("forgetPass-Otp");
            }
        }else{
            res.json({success:false,message:"User not Found "});
            console.log("the invalid email no user found ");
        }
    } catch (error) {
        
    } 
}
const resendOtp = async (req, res) => {
    try {
        if (!req.session.email) {
            return res.status(400).json({ success: false, message: "Session email not found" });
        }
        
        const otp = await generateOtp();
        const email = req.session.email; // Corrected destructuring
        const emailSent = await sendVerificationEmail(email, otp);
        
        if (emailSent) {
            req.session.userOtp = otp; 
            console.log("Resend OTP:", otp); 
            return res.status(200).json({ success: true, message: "Resend OTP successful" });
        }

        res.status(500).json({ success: false, message: "Failed to resend OTP" });
    } catch (error) {
        console.error("Error in resendOtp:", error);
        res.status(500).json({ success: false, message: "An error occurred while resending OTP" });
    };
};

const resetPass = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is required" });
        }

        if (otp == req.session.userOtp) {
            return res.status(200).json({ success: true, message: "OTP verified successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error in resetPass:", error);
        res.status(500).json({ success: false, message: "An error occurred while verifying OTP" });
    }
};



const newPass = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const email = req.session.email;

        const user = await User.findOne({ email: email });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(
            { _id: user._id },
            { password: hashedPassword },  // Directly set the password
            { new: true }  // Return the updated user document
        );

        res.status(200).json({ success: true, message: "Password reset successfull"});
    } catch (error) {
        res.status(400).json({ success: false, message: "Error in setting new password." });
        console.log(error);
    }
};

const loadNewPass = async(req,res)=>{
    try {
        res.render("resetPass")
    } catch (error) {
        res.status(400).json({success:false,message:"Error in the load newPass"})
    }
}

    
const loadProfile = async(req,res)=>{
    try {
        const user = await User.findOne({_id:req.session.user});
     

        const breadcrumbs = [
            { text:"Home" , url:"/"},
            {text:"Profile" , url:"/user/profile/"},
        ]
        res.render("profile",{
            user,
            breadcrumbs
        });
    } catch (error) {
        res.status(400).send("Error in the loadProfile");
        console.log(error)
    }
}

const loadOrderHistory = async(req,res)=>{
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page -1) * limit;

        const userId = req.session.user;
        const totalOrders = await Order.countDocuments({userId})


        const orders = await Order.find({userId})
        .skip(skip)
        .limit(limit)
        .populate("orderedItems.product", ' _id name Image description ').sort({createdAT:-1});

        const orderedItems = orders.orderedItems;

        console.log("orders:",orders,"orderedItems:",orderedItems);

        res.render("orderHistory",{orders,orderedItems,currentPage:page,totalPage:Math.ceil(totalOrders/limit)}); 
    } catch (error) {
        res.status(400).send("Error in the loadOrderHistory");
        console.log(error)
    }
}

const loadAddress = async (req, res) => {
    try {
        const user = req.session.user;
        console.log("userId:", user);

        // Find the user's address document
        const addressDoc = await Address.findOne({ userId: user });
        console.log("addressDoc:", addressDoc);


        // Extract the address array
        const address = addressDoc?.addresses || []; 

        // Proceed with your logic (e.g., render a template or send data)
        res.render("address", { user, address });

    } catch (error) {
        console.error("Error loading address:", error);
        res.status(400).send("Error in the loadAddress");
    }
};

const addNewAddress = async (req, res) => {
    try {
        const { userId, typeOfAddress, name, country, state, pincode, phone } = req.body;
        console.log("data:", userId, typeOfAddress, name, country, state, pincode, phone);

        // Check if all required fields are provided
        if (!userId || !typeOfAddress || !name || !country || !state || !pincode || !phone) {
            return res.status(500).json({ success: false, message: "Something missing in the form." });
        }

        // Find the existing address document by userId
        const addressDoc = await Address.findOne({ userId });

        if (addressDoc) {
            // If exists, push the new address into the addresses array
            addressDoc.addresses.push({
                addressType: typeOfAddress,
                name: name,
                country: country,
                state: state,
                pincode: pincode,
                phone: phone
            });

            // Save the updated document
            const updatedAddress = await addressDoc.save();

            if (updatedAddress) {
                return res.status(200).json({ success: true, message: "Successfully added new address!" });
            } else {
                return res.status(500).json({ success: false, message: "Failed to update address." });
            }
        } else {
            // If no existing document, create a new one
            const newAddress = new Address({
                userId,
                addresses: [{
                    addressType: typeOfAddress,
                    name: name,
                    country: country,
                    state: state,
                    pincode: pincode,
                    phone: phone
                }]
            });

            const addNewAddress = await newAddress.save();

            if (addNewAddress) {
                return res.status(200).json({ success: true, message: "Successfully added new address!" });
            } else {
                return res.status(500).json({ success: false, message: "Failed to add new address." });
            }
        }
    } catch (error) {
        res.status(400).send("Error in add new address.");
        console.error("Error in addNewAddress:", error);
    }
};

const editAddress = async(req,res)=>{
    try {
        const id = req.query.id;  
        const user = req.session.user;
        console.log("userID:",user)
        console.log("id:",id);

        const findAddress = await Address.findOne({ userId: user });
        
        if(!findAddress){
            return  res.status(400).json({success:true,message:"Cant Find The Address "});
        }

        const addressToEdit = await findAddress.addresses.find((add)=> add._id.toString() == id);
        console.log("adddressTOEdit:",addressToEdit);
         return res.render("editAddress",{address:addressToEdit});

    } catch (error) {
        res.status(400).json({success:false,message:"ERROR in editAddress"});
        console.log("ERROR in edit address ",error);
    }
}

const editedAddress=async(req,res)=>{
    try {
        const {addressId,typeOfAddress,name,country,state,pincode,phone,} = req.body;
        console.log("EditedDetails:",req.body);

        if(!addressId || !typeOfAddress || !name || !country || !state || !pincode || !phone){
            return res.status(500).json({success:false,message:"Something missing in the editform "});
        }

        const updateAddress = await Address.findOneAndUpdate(
            {"addresses._id":addressId},
            {
                $set:{
                    "addresses.$.addressType":typeOfAddress,
                    "addresses.$.name":name,
                    "addresses.$.country":country,
                    "addresses.$.state":state,
                    "addresses.$.pincode":pincode,
                    "addresses.$.phone":phone,
                }
            },
            {new:true},
        );
        console.log("updateAddress:",updateAddress); 
        if(updateAddress){
            res.status(200).json({success:true,message:"EditAddress Successfull !"});
        }else{
            res.status(400).json({success:false,message:"EditAddress Faild !"});

        }

    } catch (error) {
        res.status(400).json({success:false,message:"Erroor in EditAddress  !"});
    }
};

const deleteAddress = async(req,res)=>{
    try {
        const addressId = req.body.id;
        const deleted = await Address.findOneAndUpdate(
            {"addresses._id":addressId},
            {
                $pull:{
                    addresses:{_id:addressId}
                }
            }
        );
        if(deleted){
            res.status(200).json({success:true,message:"DeleteAddress Successfull !"});
        }
    } catch (error) {
        res.status(400).json({success:false,message:"DeleteAddress Failed !"});
    }
}


const editDetails = async(req,res)=>{
    try {
        const {id,name,phone} = req.body ; 
        console.log("",id,name,phone);
        const findUser = await User.findByIdAndUpdate(
            id,
            {
                $set:{
                    name:name,
                    phone:phone,
                }
            },
            {new:true},
        );
        
        if(findUser){
            res.status(200).json({success:true , message:"Edit UserDetails Successfull "});
        }else{
            res.status(400).json({success:false,message:"Edit UserDetails Faild"});
        }
         
    } catch (error) {
        res.status(400).json({success:false,message:"Error In Edit UserDetails "});
    }
};

const editPassword = async(req,res)=>{
    try {
        const {id,currentPassword,newPassword,confirmPassword} = req.body ; 
        const findUser = await User.findById(id);
    if(findUser){
        const isMatch = await bcrypt.compare(currentPassword,findUser.password);
        if(isMatch){
            if(newPassword == confirmPassword){
                const newpass = await bcrypt.hash(newPassword,10);
                await User.findByIdAndUpdate(
                    id,
                    {
                        $set:{
                            password:newpass,
                        }
                    },
                    {new:true},
                ); 
                res.status(200).json({success:true,message:"Password Successfully Change "});
            }else{
                res.status(500).json({success:false,message:"Not Match NewPassword And ConfirmPassword"});
            }
        }else{
            res.status(500).json({success:false,message:"Not Match The currentPassword"});
        }
    }else{
        res.status(400).json({success:false,message:"Cant Find The User"});
    }        
    } catch (error) {
        res.status(400).json({success:false,message:"Error in EditPassword"});

    }
};

const editAddressOfCheckout = async(req,res)=>{
    try {
        const id = req.query.id;  
        const user = req.session.user;
        console.log("userID:",user)
        console.log("id:",id);

        const findAddress = await Address.findOne({ userId: user });
        
        if(!findAddress){
            return  res.status(400).json({success:true,message:"Cant Find The Address "});
        }

        const addressToEdit = await findAddress.addresses.find((add)=> add._id.toString() == id);
        console.log("adddressTOEdit:",addressToEdit);
         return res.render("editAddressInCheckout",{address:addressToEdit});

    } catch (error) {
        res.status(400).json({success:false,message:"ERROR in editAddress"});
        console.log("ERROR in edit address ",error);
    }
}

const editedAddressInChekout = async(req,res)=>{
    try {
        const {id,addressType,name,country,state,pincode,phone,} = req.body;
        console.log("EditedDetails:",req.body);

        if(!id || !addressType || !name || !country || !state || !pincode || !phone){
            return res.status(500).json({success:false,message:"Something missing in the editformOfCheckout "});
        }

        const updateAddress = await Address.findOneAndUpdate(
            {"addresses._id":id},
            {
                $set:{
                    "addresses.$.addressType":addressType,
                    "addresses.$.name":name,
                    "addresses.$.country":country,
                    "addresses.$.state":state,
                    "addresses.$.pincode":pincode,
                    "addresses.$.phone":phone,
                }
            },
            {new:true},
        );
        console.log("updateAddress:",updateAddress); 
        if(updateAddress){
            res.redirect("/user/checkout-page")
        }else{
            res.status(400).json({success:false,message:"EditAddress Faild !"});

        }

    } catch (error) {
        res.status(400).json({success:false,message:"Erroor in EditAddress  !"});
    }
}

const loadReferral = async(req,res)=>{
    try {
        const userId = req.session.user;
        const referral = await Referral.findOne({ userId: userId }).populate("referredUsers.userId", 'email name');
        const referredUsers = referral.referredUsers;
        console.log(referral)
        console.log(referredUsers)
        res.render("referral",{referral,referredUsers});
    } catch (error) {
        console.log(error)
        res.status(400).json({success:false,message:"Error in the loadReferral"});
    }
}

module.exports = {
    loadForgetEmail,
    verifyEmail,
    resendOtp,
    resetPass,
    newPass,
    loadNewPass,
    loadProfile ,  
    loadOrderHistory,
    loadAddress,
    addNewAddress,
    editAddress,
    editedAddress,
    deleteAddress,
    editDetails,
    editPassword,
    editAddressOfCheckout,
    editedAddressInChekout,
    loadReferral
} 