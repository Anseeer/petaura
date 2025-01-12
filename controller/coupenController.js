const Coupen = require("../model/coupenSchema");


const loadCoupen = async(req,res)=>{
    try {
        const coupen = await Coupen.find().sort({createdAt:-1});

        res.render("coupen",{coupen});
    } catch (error) {
        res.status(400).json({success:true , message:"error in the loadCoupen"});
        console.log(error);
    }
}

const loadAddCoupen = async(req,res)=>{
    try {
        res.render("addCoupen");
    } catch (error) {
        res.status(400).json({success:true , message:"error in the loadAddCoupen"});
        console.log(error);
    }
}

const addCoupen = async(req,res)=>{
    try {
        console.log("couopen Details :",req.body); 
        const {code,startDate,endDate,discountPercentage,minOrderValue,maxDiscount,description,usageLimit} = req.body;

        const existingCoupen = await Coupen.findOne({code:code}); 
        if(existingCoupen){
            res.status(400).json({success:false,message:"The Coupen Is Existing , Try Another"})
        }
        if(new Date(endDate) < new Date()){
            res.status(400).json({success:false,message:"The Expire Date Is InValid !"});
        }
        const newCoupen = new Coupen({
            code:code,
            createdAt:startDate,
            expiredAt:endDate,
            discountPercentage:discountPercentage,
            minOrderValue:minOrderValue,
            maxDiscount:maxDiscount,
            description:description,
            usageLimit:usageLimit,
            isList:true,
        });
        console.log("newcoupen :",newCoupen);
        if(newCoupen){
            await newCoupen.save();
            res.status(200).json({success:true,message:"Coupon Successfully Added"});
        }else{
            res.status(400).json({success:false,message:"Coupen Faild To Add"});
        }

    } catch (error) {
        res.status(400).json({success:false,message:"Error in add coupen"});
        console.log(error);
    }
}

const applyCoupen = async(req,res)=>{
    try {
        console.log("hey")
        console.log(req.body);
        const {inputCode,totalAmount} = req.body;

        const coupen = await Coupen.findOne({code:inputCode}); 
        console.log("coupen",coupen)

        if(! totalAmount > coupen.minOrderValue){
            res.status(500).json({success:false,message:`The Coupen is Only Allowed For The Minmum ${coupen.minOrderValue} Purchase`});
            return false;
        }

        if(new Date () > new Date(coupen.expiredAt) ){
            res.status(500).json({success:false,message:"The Coupen Is Expired"});
            return false;
        }

        if(coupen.usageLimit <= 0 ){
            res.status(500).json({success:false,message:"Coupon usage limit exceeded"});
            return false;
        }

        const updateUsageLimit = await Coupen.findOneAndUpdate(
            {code:inputCode},
            {$inc:{usageLimit: -1 }},
            {new:true}
        );
        console.log("updateUsageLimit:",updateUsageLimit);

        let discountValue = (coupen.discountPercentage/100) * totalAmount ;

        if(discountValue > coupen.maxDiscount){
             discountValue = coupen.maxDiscount;
        }
        discountValue = parseFloat(discountValue.toFixed(2));
 
        res.status(200).json({success:true,message:"SuccessFully Applyed Coupen",discountValue})

    } catch (error) {
        res.status(400).json({success:false,message:"Error In Apply Coupen"})
        console.log(error)
    }
}

const editCoupen = async(req,res)=>{
    try {
        const id = req.query.id;
        console.log("id",id);

        const coupen = await Coupen.findById(id);
        console.log(coupen)

        res.render("editCoupen",{coupen});
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error in the aditCoupen"});
    }
}
const updateCoupen = async (req, res) => {
    try {
        const {
            code,
            startDate,
            endDate,
            discountPercentage,
            minOrderValue,
            maxDiscount,
            description,
            usageLimit,
            id
        } = req.body;

        console.log("Request Body:", req.body);

        // Convert startDate and endDate to Date objects
        const startDateFormatted = new Date(startDate);
        const endDateFormatted = new Date(endDate);

        // Check if ID is valid
        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required" });
        }

        const update = await Coupen.findOneAndUpdate(
            {_id:id},
            {
                $set: {
                    code: code,
                    createdAt: startDateFormatted,
                    expiredAt: endDateFormatted,
                    discountPercentage: discountPercentage,
                    minOrderValue: minOrderValue,
                    maxDiscount: maxDiscount,
                    description: description,
                    usageLimit: usageLimit,
                },
            },
            { new: true } 
        );

        console.log("hey")

        if (update) {
            console.log("Updated Document:", update);
            return res.status(200).json({ success: true, message: "Successfully Edited", data: update });
        } else {
            console.log("Update failed");
            return res.status(400).json({ success: false, message: "Failed to Edit" });
        }
    } catch (error) {
        console.error("Error in updateCoupen:", error);
        return res.status(500).json({ success: false, message: "Error in updating Coupen", error: error.message });
    }
};

const deleteCoupen = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id); 
        const coupenDelete = await Coupen.findByIdAndDelete(id);
        console.log("coupen", coupenDelete);
        if (coupenDelete) {
            res.status(200).json({ success: true, message: "Successfully Deleted" });
        } else {
            res.status(400).json({ success: false, message: "Failed To Delete" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error in Delete Coupen" });
    }
};

const inActiveCoupen = async(req, res) => {
    try {
      const code = req.query.code;
      console.log("Query:", req.query); // Log the full query object
      console.log("Code received:", req.query.code); // Log the code specifically

      const coupen = await Coupen.findOneAndUpdate(
        { code },
        { $set: { isActive: false } },
        { new: true } // Ensure the updated document is returned
      );
      console.log("coupen:", coupen);
      if (!coupen) {
        console.log("Coupon not found");
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
      let data = await Coupen.find({});
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error during coupon update:", error);
      res.status(400).json({ success: false, message: "Error in inActiveCoupen function" });
    }
  };
  
  const ActiveCoupen = async(req, res) => {
    try {
      const code = req.query.code;
      const coupen = await Coupen.findOneAndUpdate(
        { code },
        { $set: { isActive: true } },
        { new: true } // Ensure the updated document is returned
      );
      console.log("coupen:", coupen);
      if (!coupen) {
        console.log("Coupon not found");
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
      let data = await Coupen.find({});
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error during coupon update:", error);
      res.status(400).json({ success: false, message: "Error in ActiveCoupen function" });
    }
  };
  


module.exports = {
    loadCoupen,
    loadAddCoupen,
    addCoupen,
    applyCoupen,
    editCoupen,
    updateCoupen,
    deleteCoupen,
    inActiveCoupen,
    ActiveCoupen
}