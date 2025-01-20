const Order = require("../model/orderSchema");
const Product = require("../model/productSchema"); 
const Wallet = require("../model/walletSchema"); 
const PendingOrder = require("../model/pendingOrderSchema"); 
const User = require("../model/userSchema");
const ReturnRequest = require("../model/returnRequestSchema");
const env = require('dotenv').config();
const PDFDocument = require('pdfkit');


const  loadOrder = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
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
    }
}

const updateStatus = async (req, res) => {
    try {
        const { orderId,status} = req.body;

        if (status === 'canceled') {
            const order = await Order.findOne({ orderId });
        
            // Update order and items status to "canceled"
            order.status = "canceled";
            order.orderedItems.forEach((item) => {
                item.status = "canceled";
            });
            await order.save();
        
            // Handle refund if payment was made
            if (order.paymentStatus === "PAID") {
                const wallet = await Wallet.findOne({ userId: order.userId });
        
                if (!wallet) {
                    return res.status(400).json({
                        success: false,
                        message: "Wallet not found for the user",
                    });
                }
        
                const transactionId = generateTransactionId();
        
                // Update wallet balance and history
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
        
            // Restock canceled products
            for (const item of order.orderedItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.quantity += item.quantity;
                    await product.save();
                }
            }
        } else if (status === 'delivered') {
            const order = await Order.findOne({ orderId });

            const now = new Date();
            const deadline = new Date(now); 
             deadline.setDate(now.getDate() + 14); 

        
            order.returnDeadline = deadline;
            
            order.status = "delivered";
            order.orderedItems.forEach((item) => {
                item.status = "delivered";
            });
            await order.save();
        
        }
        res.status(200).json({success:true,mesage:"Updated !"});
    } catch (error) {
       
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

function generateTransactionId() {
    const timestamp = Date.now().toString();  // Current timestamp in milliseconds
    const randomPart = Math.random().toString(36).substring(2, 10);  // Random string part
    return `TXN-${timestamp}-${randomPart}`;  // Format with a prefix for better readability
}
const updateRequestStatus = async (req, res) => {
    try {
        const { productId, orderId, status } = req.body;

        // Validate request data
        if (!productId || !orderId || !status) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: productId, orderId, or status.",
            });
        }

   

        const requestedOrder = await ReturnRequest.findOne({ orderId ,productId});
        if (!requestedOrder) {
            return res.status(404).json({
                success: false,
                message: "Return request not found.",
            });
        }

        // Handle approval logic
        if (status === "approved") {
            const productIncrement = await Product.findOneAndUpdate(
                { _id: productId },
                { $inc: { quantity: requestedOrder.quantity } },
                { new: true }
            );

            const requestStatus = await ReturnRequest.findOneAndUpdate(
                { orderId ,productId},
                { $set: { status } },
                { new: true }
            );

            const orderStatus = await Order.findOneAndUpdate(
                { orderId, "orderedItems.product": productId },
                { $set: { "orderedItems.$.status": "approved" } },
                { new: true }
            );

           

            // Handle wallet refund if payment status is PAID
            const order = await Order.findOne({ orderId });
            const user = order.userId;
            if (order.paymentStatus === "PAID") {
                const wallet = await Wallet.findOne({ userId: user });
                if (!wallet) {
                    return res.status(404).json({
                        success: false,
                        message: "Wallet not found for the user.",
                    });
                }

                const transactionId = generateTransactionId();
                wallet.balance += requestedOrder.price;
                wallet.history.push({
                    transactionId,
                    type: "CREDIT",
                    amount: requestedOrder.price,
                    description: "Refund for order returned",
                    date: new Date(),
                });

                await wallet.save();
            }

            // Check if all items in the order are approved
            const updatedOrder = await Order.findOne({ orderId });
            const allItemsApproved = updatedOrder.orderedItems.every(
                (item) => item.status === "approved"
            );

            if (allItemsApproved) {
                await Order.findOneAndUpdate(
                    { orderId },
                    { $set: { status: "approved" } },
                    { new: true }
                );
            }

            return res.status(200).json({ success: true, message: "Request approved successfully." });
        }

        // Handle rejection logic
        if (status === "rejected") {
            const requestStatus = await ReturnRequest.findOneAndUpdate(
                { orderId },
                { $set: { status } },
                { new: true }
            );

            const orderStatus = await Order.findOneAndUpdate(
                { orderId, "orderedItems.product": productId },
                { $set: { "orderedItems.$.status": "rejected" } },
                { new: true }
            );

            return res.status(200).json({ success: true, message: "Request rejected successfully." });
        }

        // Invalid status
        return res.status(400).json({ success: false, message: "Invalid status provided." });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update request status. Please try again.",
        });
    }
};


const orderDetails = async(req,res)=>{
    try {
        const {orderId} = req.query;
        const userId = req.session.user;
        const user = await User.findById(userId);
        const order = await Order.findOne({orderId}); 
        
        
        const address = order.address;
        
        
        res.render("orderDetails",{order,user,address});  

    } catch (error) {
        res.status(400).json({success:false,message:"Error in the order detail loading"});
    }
}

const pendingOrderDetails = async(req,res)=>{
    try {
        const {orderId} = req.query;
        const userId = req.session.user;
        const user = await User.findById(userId);
        const pendingOrder = await PendingOrder.findOne({orderId}); 
        
        
        const address = pendingOrder.address;
        
        
        res.render("pendingOrderDetails",{pendingOrder,user,address});   

    } catch (error) {
        res.status(400).json({success:false,message:"Error in the order detail loading"});
    }
}
function generateTransactionId() {
    const timestamp = Date.now().toString();  // Current timestamp in milliseconds
    const randomPart = Math.random().toString(36).substring(2, 10);  // Random string part
    return `TXN-${timestamp}-${randomPart}`;  // Format with a prefix for better readability
};

const orderCancel = async (req, res) => {
    try {
        const {orderId} = req.body; 
        const user = req.session.user; 

        // Set the order status to "canceled"
        const orderCancel = await Order.updateOne(
            { userId:user,orderId}, 
            { $set: { status: "canceled" } }
        );
        const order = await Order.findOne({ userId:user, orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found for the given user and order ID",
            });
        }
        order.orderedItems.forEach((item)=>{
            item.status = "canceled";
        }) 
        order.save();

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
        for (const item of order.orderedItems) {
            const product = await Product.findById(item.product);
            if (product) {
              product.quantity += item.quantity;
              await product.save();
            }
          }
          
        // Respond to the client
        res.status(200).json({ 
            success: true, 
            message: "Order cancellation successful, product quantities updated" 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error in OrderCancel" });
    }
};

const SingleorderCancel = async (req, res) => {
    try {
        const { itemId, orderId } = req.body;

        // Find the order and the specific ordered item
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const orderedItem = order.orderedItems.find((item) => item._id.toString() === itemId.toString());
        if (!orderedItem) {
            return res.status(404).json({ success: false, message: "Ordered item not found" });
        }

        // Update the item's status in the order
        await Order.findOneAndUpdate(
            { orderId, 'orderedItems._id': itemId },
            { $set: { 'orderedItems.$.status': 'canceled' } }
        );

        // If the payment is completed, refund to wallet
        if (order.paymentStatus === "PAID") {
            const wallet = await Wallet.findOne({ userId: order.userId });
            if (!wallet) {
                return res.status(400).json({ success: false, message: "Wallet not found for the user" });
            }

            // Generate a transaction ID
            const transactionId = generateTransactionId();

            // Update the wallet balance and add to history
            wallet.balance += orderedItem.totalPrice;
            wallet.history.push({
                transactionId,
                type: "CREDIT",
                amount: orderedItem.totalPrice,
                description: "Refund for order cancellation",
                date: new Date(),
            });

            await wallet.save();
        }

        // Update the product stock
        const product = await Product.findById(orderedItem.product);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        product.quantity += orderedItem.quantity;
        await product.save();

        const updatedOrder = await Order.findOne({ orderId });
        const allItemsCanceled = updatedOrder.orderedItems.every((item) => item.status === "canceled");

        // If all items are canceled, update the order status
        if (allItemsCanceled) {
            await Order.findOneAndUpdate(
                { orderId },
                { $set: { status: "canceled" } }
            );
        }
        return res.status(200).json({ success: true, message: "Order item canceled successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in the SingleOrderCancel", error });
    }
};

const orderReturn = async(req,res)=>{
    try {
        const { id } = req.body; // Order ID to cancel
        const user = req.session.user; 
        

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
        


        if (order.paymentStatus === "PAID") {
            const wallet = await Wallet.findOne({ userId: user });

            if (!wallet) {
                return res.status(400).json({
                    success: false,
                    message: "Wallet not found for the user",
                });
            }


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


        // Respond to the client
        res.status(200).json({ 
            success: true, 
            message: "Order return successful, product quantities updated" 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error in orderReturn" });
    }
}

const returnRequest = async (req, res) => {
    try {
        const {itemId,orderId,reason } = req.body;

        const order = await Order.findOne({orderId});
        const orderedItem = await order.orderedItems.find((item)=> item._id.toString() == itemId.toString() );
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found or already returned." });
        }

        const request = new ReturnRequest({
            productId:orderedItem.product,
            orderId,
            userId:order.userId,
            reason,
            quantity:orderedItem.quantity,
            price:orderedItem.totalPrice,
        });
        await request.save();

        const productStatus = await Order.findOneAndUpdate(
            { orderId, "orderedItems._id": itemId },
            { $set: { "orderedItems.$.status": "requested" } },
            { new: true }
        );

        if (productStatus) {
            res.status(200).json({ success: true, message: "Return request successfully processed" });
        } else {
            res.status(400).json({ success: false, message: "Failed to update order status" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to process return request" });
    }
};

const returnRequestPage = async(req,res)=>{
    try {
        const requestedItem = await ReturnRequest.find({}).populate("productId",'name Image').sort({createdAt:-1});
        res.render("returnRequest",{requestedItem});
    } catch (error) {
        
    }
}

const orderDetailsPage = async(req,res)=>{
    try {
        const {orderId} = req.query;
        const userId = req.session.user;
        const user = await User.findById(userId);
        const order = await Order.findOne({orderId}); 
        
        
        const address = order.address;
        
        
        
        res.render("orderDetailsPage",{order,user,address});  

    } catch (error) {
        res.status(400).json({success:false,message:"ERROR in the orderDetailsPage"});
    }
}

const updatePendingOrder = async(req,res)=>{
    try {
        const {razorPayOrderId} = req.body;
        const findOrder = await PendingOrder.find({razorPayOrderId});

        const razorpayKey = process.env.RAZORPAY_KEY;
         res.status(200).json({success:true,pendingOrder:findOrder,razorpayKey})

    } catch (error) {
        res.status(400).json({success:false,message:"Error in the updatePendingOrder Function"});
    }
}

const generateSalesInvoice = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Fetch order and populate necessary fields
        const order = await Order.findOne({ orderId })
            .populate('userId')
            .populate('orderedItems.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Generate the invoice
        generateInvoice(order, res);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
function generateInvoice(order, res) {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `invoice-${order.orderId}.pdf`;

    // Set response headers for PDF
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Invoice header
    doc
        .fontSize(24)
        .text('Petaura Order Invoice', { align: 'center' })
        .fontSize(10)
        .fillColor('gray')
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
        .moveDown(2);

    // Company and Billing Info
    const address = order.address[0] || {};
    doc
        .text('PETAURA Ltd.', 50, 100)
        .text('Kasaragod, VT / 82021', 50, 115)
        .text('Phone: 7736222757', 50, 130)
        .text(`Name: ${address.name || 'N/A'}`, 400, 100, { align: 'right' })
        .text(`${address.country || ''}, ${address.state || ''}`, 400, 115, { align: 'right' })
        .text(`Pincode: ${address.pincode || ''}`, 400, 130, { align: 'right' })
        .text(`Phone: ${address.phone || ''}`, 400, 145, { align: 'right' });

    doc
        .moveDown(2)
        .fontSize(10)
        .text(`Invoice Number: ${order.orderId}`, 50, 200)
        .text(`Order Date: ${new Date(order.createdAT).toLocaleDateString() || 'N/A'}`, 50, 215);

    // Product Table Header
    const tableTop = 270;
    const rowHeight = 20;

    doc
        .fontSize(10)
        .text('Product', 50, tableTop)
        .text('Quantity', 250, tableTop, { width: 50, align: 'right' })
        .text('Price', 350, tableTop, { width: 50, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#cccccc');

    let position = tableTop + rowHeight;

    // List Products
    order.orderedItems.forEach(item => {
        const productName = item.product?.name || 'Unknown Product';
        const productPrice = parseFloat(item.price) || 0;
        const productQuantity = parseInt(item.quantity) || 1;

        doc
            .fontSize(10)
            .text(productName, 50, position)
            .text(productQuantity, 300, position, { width: 50, align: 'right' })
            .text(productPrice.toFixed(2), 380, position, { width: 50, align: 'right' });

        position += rowHeight;
    });

    doc.moveTo(50, position).lineTo(550, position).stroke('#cccccc');
    position += 10;

    // Invoice Totals
    const discount = parseFloat(order.discount) || 0;
    const deliveryFee = parseFloat(order.deliveryFee) || 0;
    const finalPrice = parseFloat(order.finalPrice) || 0;

    doc
        .text('Discount:', 300, position)
        .text(`-${discount.toFixed(2)}`, 450, position, { width: 50, align: 'right' });

    doc
        .text('Delivery Fee:', 300, position + 20)
        .text(deliveryFee.toFixed(2), 450, position + 20, { width: 50, align: 'right' });

    doc
        .text('Final Price:', 300, position + 40)
        .fontSize(14)
        .text(finalPrice.toFixed(2), 450, position + 40, { width: 55, align: 'right' });

    // Footer
    doc
        .moveDown(4)
        .fontSize(10)
        .text('Terms')
        .text('Please make a transfer to:')
        .text('petaura')
        .text('IBAN: GB23 2344 2334423234423')
        .text('BIC: petaura')
        .moveDown(1)
        .text('Generated by iDeal. All amounts in INR.')
        .text('For queries, contact support@petaura.com.');

    doc.end();
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
    pendingOrderDetails,
    generateSalesInvoice,
    SingleorderCancel
}