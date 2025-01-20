const User = require("../model/userSchema");
const Address = require("../model/addressSchema");
const Order = require("../model/orderSchema");
const PendingOrder = require("../model/pendingOrderSchema");
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
        const info = await transporter.sendMail({
            from: `"PetAura Support" <${process.env.NODEMAILER_EMAIL}>`, // Friendly sender name
            to: email,
            subject: "Reset Your PetAura Password",
            text: `Hello, 
        
        We received a request to reset your password for your PetAura account. Use the OTP below to reset your password:
        
        Your OTP: ${otp}
        
        If you didn’t request this, please ignore this email. Your account is safe.
        
        Best Regards, 
        The PetAura Team`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Reset Your Password</h2>
                <p>We received a request to reset your password for your PetAura account. Use the OTP below to reset your password:</p>
                <div style="text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0;">
                    Your OTP: <span style="color: #4CAF50;">${otp}</span>
                </div>
                <p>If you didn’t request this, please ignore this email. Your account is safe.</p>
                <p>Best Regards,</p>
                <p><strong>The PetAura Team</strong></p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
            </div>`
        });
        
        return info.accepted.length > 0 ;

    } catch (error) {
        res.status(400).render("error",{message:"ERROR SENDING EMAIL "});
        return false;
    }
}

const loadForgetEmail = async(req,res)=>{
    try {
        res.render("forgetPass-email");
    } catch (error) {
        res.json({success:false,message:"ERROR in load forgetEMail"});
        
    }
}

const verifyEmail= async(req,res)=>{
    try {
        const {email} = req.body;
        
        const findUser = await User.findOne({email:email});
        if(findUser){
            const otp= await  generateOtp();
            const sentMail = await sendVerificationEmail(email,otp);
            if(sentMail){
                req.session.userOtp = otp;
                req.session.email=email;
                res.status(200).json({success:true,message:"otp sent"});
            }
        }else{
            res.json({success:false,message:"User not Found "});
        }
    } catch (error) {
        res.status(500).json({success:false,message:"Error in the verify email"})
    } 
}

const loadForgetPassOtp = async(req,res)=>{
    try {
        res.render("forgetPass-Otp");
    } catch (error) {
        res.json({success:false,message:"Error in load loadForgetPassOtp"});
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
    }
}

const loadOrderHistory = async(req,res)=>{
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page -1) * limit;

        const userId = req.session.user;
        const totalOrders = await Order.countDocuments({userId})

        const pending = await PendingOrder.find({userId}).populate("orderedItems.product", ' _id name Image description ').sort({createdAT:-1});
        
        const pendingOrders = pending.orderedItems;
        const orders = await Order.find({userId})
        .skip(skip)
        .limit(limit)
        .populate("orderedItems.product", ' _id name Image description ')
        .sort({createdAT:-1});

        const orderedItems = orders.orderedItems;


        res.render("orderHistory",{orders,orderedItems,pendingOrders,pending,currentPage:page,totalPage:Math.ceil(totalOrders/limit)}); 
    } catch (error) {
        res.status(400).send("Error in the loadOrderHistory");
    }
}

const loadAddress = async (req, res) => {
    try {
        const user = req.session.user;

        // Find the user's address document
        const addressDoc = await Address.findOne({ userId: user });

        // Extract the address array
        const address = addressDoc?.addresses || []; 

        // Proceed with your logic (e.g., render a template or send data)
        res.render("address", { user, address });

    } catch (error) {
        res.status(400).send("Error in the loadAddress");
    }
};

const addNewAddress = async (req, res) => {
    try {
        const { userId, typeOfAddress, name, country, state, pincode, phone } = req.body;

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
    }
};

const addAddress = async(req,res)=>{
    try {
        const user= req.session.user;
        res.render("addAddress",{user});
    } catch (error) {
        res.status(404).json({success:false,message:"Can not found the AddAddress page"})
    }
}
 
const editAddress = async(req,res)=>{
    try {
        const id = req.query.id;  
        const user = req.session.user;
       

        const findAddress = await Address.findOne({ userId: user });
        
        if(!findAddress){
            return  res.status(400).json({success:true,message:"Cant Find The Address "});
        }

        const addressToEdit = await findAddress.addresses.find((add)=> add._id.toString() == id);
         return res.render("editAddress",{address:addressToEdit});

    } catch (error) {
        res.status(400).json({success:false,message:"ERROR in editAddress"});
    }
}

const editedAddress=async(req,res)=>{
    try {
        const {addressId,typeOfAddress,name,country,state,pincode,phone,} = req.body;

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
       

        const findAddress = await Address.findOne({ userId: user });
        
        if(!findAddress){
            return  res.status(400).json({success:true,message:"Cant Find The Address "});
        }

        const addressToEdit = await findAddress.addresses.find((add)=> add._id.toString() == id);
         return res.render("editAddressInCheckout",{address:addressToEdit});

    } catch (error) {
        res.status(400).json({success:false,message:"ERROR in editAddress"});
    }
}

const editedAddressInChekout = async(req,res)=>{
    try {
        const {id,addressType,name,country,state,pincode,phone,} = req.body;

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
        const user = req.session.user;
        const referral = await Referral.findOne({ userId: user }).populate(
            'referredUsers.userId', // Path to populate
            'email name' // Fields to include from User model
        );
        const referredUsers = referral.referredUsers;
        res.render("referral",{referral,referredUsers});
    } catch (error) {
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
    loadReferral,
    addAddress,
    loadForgetPassOtp
} 