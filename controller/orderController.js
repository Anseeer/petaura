const Order = require("../model/orderSchema");
const Product = require("../model/productSchema"); 
const Wallet = require("../model/walletSchema"); 
const PendingOrder = require("../model/pendingOrderSchema"); 
const User = require("../model/userSchema");
const ReturnRequest = require("../model/returnRequestSchema");
const env = require('dotenv').config();

const  loadOrder = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit ;
        const total = await Order.countDocuments({});
        const orders = await Order.find()
        .sort({createdAT:-1})
        .skip(skip)
        .limit(limit)
        .populate("orderedItems.product","_id name Image status quantity")
        
        res.render("orderManagement",{orders,currentPage:page,totalPage:Math.ceil(total/limit)});
    } catch (error) {
        res.status(400).json({success:false,message:"Error In loadOrder"})
        console.log(error)
    }
}

const updateStatus = async (req, res) => {
    try {
        const { orderId, userId, orderedItemsId , productId ,productQty, status} = req.body;

        if (!orderId || !userId || !orderedItemsId || !productId || !status) {
            return res.status(400).json({ success: false, message: "Invalid request parameters." });
        }

        // Log the request body only for valid requests
        console.log("Request Body:", req.body);

        // If the status is "canceled", revert the stock quantity of ordered items
        if (status === "canceled" ) {
           await Product.findOneAndUpdate(
            {_id:productId},
            {$inc:{quantity:productQty}},
            {new:true}
           );
        }
        const order = await Order.findOne({orderId});
        if(status == "canceled"){
            if (order.paymentStatus === "PAID") {
                const wallet = await Wallet.findOne({ userId: userId });
    
                if (!wallet) {
                    return res.status(400).json({
                        success: false,
                        message: "Wallet not found for the user",
                    });
                }
    
                console.log("WALLET:", wallet);
    
                // Update balance and add transaction history
                wallet.balance += order.finalPrice;
                wallet.history.push({
                    type: "CREDIT",
                    amount: order.finalPrice,
                    description: "Refund for order cancellation",
                    date: new Date(),
                });
    
                await wallet.save();
            }    
        }
        
        // Update the order status
        const updateResult = await Order.findOneAndUpdate(
            { orderId ,userId ,"orderedItems._id":orderedItemsId},
            { $set: { "orderedItems.$.status" : status} },
            { new: true }
        );
    
        if (!updateResult) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        console.log("Order Updated:", updateResult);


        return res.status(200).json({ success: true, message: "Order status updated successfully." });
    } catch (error) {
        console.error("Error in updateStatus:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};
function generateTransactionId() {
    const timestamp = Date.now().toString();  // Current timestamp in milliseconds
    const randomPart = Math.random().toString(36).substring(2, 10);  // Random string part
    return `TXN-${timestamp}-${randomPart}`;  // Format with a prefix for better readability
}
const updateRequestStatus = async(req,res)=>{
    try {


    const {requestedItemId, productId, orderId, productQty , productPrice, status} = req.body;
    console.log("Req.body",req.body);
        if(status == "approved"){
            const productIncrement = await Product.findOneAndUpdate(
                {_id:productId},
                {$inc:{quantity:productQty}},
                {new:true},
            );
        
            const requestStatus = await ReturnRequest.findOneAndUpdate(
                {_id:requestedItemId,orderId},
                {$set:{status}},
                {new:true}
            ); 
        
            const orderStatus = await Order.findOneAndUpdate(
                {orderId,"orderedItems.product":productId},
                {$set:{"orderedItems.$.status":"approved"}},
                {new:true}
            );
        
        
            if(orderStatus){
                console.log("update status of the orderedItem");
            }
            
            if(requestStatus){
                console.log("Update status of the requstedItem");
            }
        
            if(productIncrement){
                console.log("increment the ProductQty");
            }
        
            const order = await Order.findOne({orderId});
            const user = order.userId;
             if (order.paymentStatus === "PAID") {
                    const wallet = await Wallet.findOne({ userId: user });
        
                    if (!wallet) {
                        return res.status(400).json({
                            success: false,
                            message: "Wallet not found for the user",
                        });
                    }
                    
                    
                    // Example usage:
                    const transactionId = generateTransactionId();
                    console.log("WALLET:", wallet);
        
                    // Update balance and add transaction history
                    wallet.balance += order.finalPrice;
                    wallet.history.push({
                        transactionId,
                        type: "CREDIT",
                        amount: order.finalPrice,
                        description: "Refund for order returned",
                        date: new Date(),
                    });
        
                    await wallet.save();
                } 
        
                res.status(200).json({success:true,message:"Approved"});
        }else if( status == "rejected"){
            const requestStatus = await ReturnRequest.findOneAndUpdate(
                {_id:requestedItemId,orderId},
                {$set:{status}},
                {new:true}
            ); 
        
            const orderStatus = await Order.findOneAndUpdate(
                {orderId,"orderedItems.product":productId},
                {$set:{"orderedItems.$.status":"rejected"}},
                {new:true}
            );
            if(orderStatus){
                console.log("update status of the orderedItem");
            }
            
            if(requestStatus){
                console.log("Update status of the requstedItem");
            }

    res.status(200).json({success:true,message:"Rejected"});

        }
   
        
    } catch (error) {
        res.status(400).json({success:false,message:"Faild To Approve The Request !"})
    }
}

const orderDetails = async(req,res)=>{
    try {
        const {productId,orderId,orderedItemsId} = req.query;
        console.log("orderedItemsId",orderedItemsId);
        const userId = req.session.user;
        const user = await User.findById(userId);
        const order = await Order.findOne({orderId}); 
        const product = await order.orderedItems.find((item)=>{
          return   item.product.toString() == productId.toString()
        })
        const orderedItem = order.orderedItems.find((item) => {
            return item._id.toString() === orderedItemsId.toString();
        });
        
        const address = order.address;
        
        console.log("order:",order);
        console.log("product:",product);
        console.log("address:",address);
        
        res.render("orderDetails",{order,user,orderedItem,product,address});  

    } catch (error) {
        res.status(400).json({success:false,message:"Error in the order detail loading"});
        console.log(error)
    }
}

const pendingOrderDetails = async(req,res)=>{
    try {
        const {productId,orderId,orderedItemsId} = req.query;
        console.log("orderedItemsId",orderedItemsId);
        const userId = req.session.user;
        const user = await User.findById(userId);
        const order = await PendingOrder.findOne({orderId}); 
        const product = await order.orderedItems.find((item)=>{
          return   item.product.toString() == productId.toString()
        })
        const orderedItem = order.orderedItems.find((item) => {
            return item._id.toString() === orderedItemsId.toString();
        });
        
        const address = order.address;
        
        console.log("order:",order);
        console.log("product:",product);
        console.log("address:",address);
        
        res.render("pendingOrderDetails",{order,user,orderedItem,product,address});  

    } catch (error) {
        res.status(400).json({success:false,message:"Error in the order detail loading"});
        console.log(error)
    }
}
function generateTransactionId() {
    const timestamp = Date.now().toString();  // Current timestamp in milliseconds
    const randomPart = Math.random().toString(36).substring(2, 10);  // Random string part
    return `TXN-${timestamp}-${randomPart}`;  // Format with a prefix for better readability
}
const orderCancel = async (req, res) => {
    try {
        const {orderId, productQyt, orderedItemId ,productId} = req.body; 
        const user = req.session.user; 
        
        console.log("Order ID , quantiyt , productId to cancel:", req.body);

        // Set the order status to "canceled"
        const orderCancel = await Order.updateOne(
            { orderId,"orderedItems._id": orderedItemId}, 
            { $set: { "orderedItems.$.status": "canceled" } }
        );

        console.log("Set orderedItems status Canceld",orderCancel);

        // Find the specific order and its ordered items
        const order = await Order.findOne({ userId: user, orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found for the given user and order ID",
            });
        }
        
        console.log("Order to cancel:", order);


        if (order.paymentStatus === "PAID") {
            const wallet = await Wallet.findOne({ userId: user });

            if (!wallet) {
                return res.status(400).json({
                    success: false,
                    message: "Wallet not found for the user",
                });
            }

            console.log("WALLET:", wallet);
           
            
            // Example usage:
            const transactionId = generateTransactionId();

            // Update balance and add transaction history
            wallet.balance += order.finalPrice;
            wallet.history.push({
                transactionId,
                type: "CREDIT",
                amount: order.finalPrice,
                description: "Refund for order cancellation",
                date: new Date(),
            });

            await wallet.save();
        }

        // Iterate over each product in orderedItems
       const productIncrement = await Product.updateOne(
        {_id:productId},
        {$inc:{quantity:productQyt}},
        {new:true},
       );

       console.log("incremented ",productIncrement);

        // Respond to the client
        res.status(200).json({ 
            success: true, 
            message: "Order cancellation successful, product quantities updated" 
        });
    } catch (error) {
        console.error("Error in OrderCancel:", error);
        res.status(400).json({ success: false, message: "Error in OrderCancel" });
    }
};

const orderReturn = async(req,res)=>{
    try {
        const { id } = req.body; // Order ID to cancel
        const user = req.session.user; 
        
        console.log("Order ID to return:", id);

        // Set the order status to "canceled"
        const orderReturn = await Order.updateOne(
            { userId: user, orderId: id }, 
            { $set: { status: "returned" } }
        );

        // Find the specific order and its ordered items
        const order = await Order.findOne({ userId: user, orderId: id });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found for the given user and order ID",
            });
        }
        
        console.log("Order to cancel:", order);


        if (order.paymentStatus === "PAID") {
            const wallet = await Wallet.findOne({ userId: user });

            if (!wallet) {
                return res.status(400).json({
                    success: false,
                    message: "Wallet not found for the user",
                });
            }

            console.log("WALLET:", wallet);

            // Update balance and add transaction history
            wallet.balance += order.finalPrice;
            wallet.history.push({
                type: "CREDIT",
                amount: order.finalPrice,
                description: "Refund for order returned",
                date: new Date(),
            });

            await wallet.save();
        }

        // Iterate over each product in orderedItems
        const updatePromises = order.orderedItems.map(async (item) => {
            const { product, quantity } = item;
            return Product.findOneAndUpdate(
                { _id: product },
                { $inc: { quantity } }, // Increment the quantity of the product
                { new: true }
            );
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        console.log("Quantities of all products incremented");

        // Respond to the client
        res.status(200).json({ 
            success: true, 
            message: "Order return successful, product quantities updated" 
        });
    } catch (error) {
        console.error("Error in orderReturn:", error);
        res.status(400).json({ success: false, message: "Error in orderReturn" });
    }
}

const returnRequest = async (req, res) => {
    try {
        const { orderId, userId, productId, orderedItemId,productQty , productPrice, reason } = req.body;
        console.log("body:", req.body);

        const request = new ReturnRequest({
            productId,
            orderId,
            userId,
            reason,
            quantity:productQty,
            price:productPrice,
        });
        await request.save();

        const productStatus = await Order.findOneAndUpdate(
            { orderId, "orderedItems._id": orderedItemId },
            { $set: { "orderedItems.$.status": "requested" } },
            { new: true }
        );

        if (productStatus) {
            res.status(200).json({ success: true, message: "Return request successfully processed" });
        } else {
            res.status(400).json({ success: false, message: "Failed to update order status" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to process return request" });
    }
};

const returnRequestPage = async(req,res)=>{
    try {
        const requestedItem = await ReturnRequest.find({}).populate("productId",'name Image').sort({createdAt:-1});
        console.log("requested:",requestedItem);
        res.render("returnRequest",{requestedItem});
    } catch (error) {
        
    }
}

const orderDetailsPage = async(req,res)=>{
    try {
        const {productId,orderId,orderedItemId} = req.query;
        console.log(req.query);

        const product = await Product.findById(productId);
        console.log("product",product);
        const order = await Order.findOne({orderId});
        const orderedItem = await order.orderedItems.find((item)=>{
            return item._id.toString() === orderedItemId.toString()
        });
        console.log("order:",order);
        console.log("orderedItem:",orderedItem);


        res.render("orderDetailsPage",{product,order,orderedItem});
    } catch (error) {
        res.status(400).json({success:false,message:"ERROR in the orderDetailsPage"});
    }
}

const updatePendingOrder = async(req,res)=>{
    try {
        const {razorPayOrderId} = req.body;
        console.log(req.body);
        const findOrder = await PendingOrder.find({razorPayOrderId});

        console.log("PendingOrder:",findOrder);
        const razorpayKey = process.env.RAZORPAY_KEY;
         res.status(200).json({success:true,pendingOrder:findOrder,razorpayKey})

    } catch (error) {
        res.status(400).json({success:false,message:"Error in the updatePendingOrder Function"});
    }
}

module.exports = {
    loadOrder ,
    updateStatus,
    orderCancel,
    orderDetails,
    orderReturn,
    returnRequest,
    returnRequestPage,
    updateRequestStatus,
    orderDetailsPage,
    updatePendingOrder,
    pendingOrderDetails
}