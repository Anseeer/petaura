const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const customerController = require("../controller/customerController");
const categoryController = require("../controller/categoryController");
const productsController = require("../controller/productsController");
const orderController = require("../controller/orderController");
const coupenController = require("../controller/coupenController");
const offerController = require("../controller/offerController");
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const {adminauth} = require("../middlwares/auth");


router.get("/login",adminController.loadLogin);
router.post("/login",adminController.login);
router.get("/dashboard",adminauth,adminController.loadDashboard);
router.get("/logout",adminauth,adminController.logout);
// Customer management 
router.get("/list-customer",adminauth,customerController.loadCustomerList);
router.get("/blockCustomer",adminauth,customerController.blockCustomer);
router.get("/unblockCustomer",adminauth,customerController.unblockCustomer);
router.get("/deleteCustomer",adminauth,customerController.deleteCustomer);
router.get("/addCustomer",adminauth,customerController.loadAddCustomer);
router.post("/addCustomer",adminauth,customerController.addCustomer);
// category management 
router.get("/category",adminauth,categoryController.categoryInfo);
router.post("/addCategory",adminauth,categoryController.addCategory);
router.get("/deleteCategory",adminauth,categoryController.deleteCategory);
router.get("/deleteParentCategory",adminauth,categoryController.deleteParentCategory);
router.get("/editCategory",adminauth,categoryController.loadEditCategory);
router.post("/editCategory",adminauth,categoryController.editCategory);
router.get("/ListCategory",adminauth,categoryController.ListCategory);
router.get("/unListCategory",adminauth,categoryController.unListCategory);
router.post("/addParentCategory",adminauth,categoryController.addParentCategory);
router.get("/editParentCategory",adminauth,categoryController.loadeditParentCategory);
router.post("/editParentCategory",adminauth,categoryController.editParentCategory);
// order managemnt
router.get("/order",adminauth,orderController.loadOrder)
router.post("/edit-order-status",adminauth,orderController.updateStatus)
router.post("/order-cancel",adminauth,orderController.orderCancel);
router.post("/update-returnRequest-status",adminauth,orderController.updateRequestStatus);
router.get("/load-return-request",adminauth,orderController.returnRequestPage);
router.get("/order-details",adminauth,orderController.orderDetailsPage);

// coupen management 
router.get("/coupen",adminauth,coupenController.loadCoupen);
router.get("/add-coupen",adminauth,coupenController.loadAddCoupen);
router.post("/add-coupen",adminauth,coupenController.addCoupen);
router.post("/apply-coupen",adminauth,coupenController.applyCoupen);
router.get("/edit-coupon",adminauth,coupenController.editCoupen);
router.post("/edit-coupon",adminauth,coupenController.updateCoupen);
router.get("/delete-coupen",adminauth,coupenController.deleteCoupen);

// salesReport
router.get("/sales-report",adminauth,adminController.loadSalesReport);
// router.post("/sales-report",adminController.loadSalesReportForCustomDate);
router.post("/filter-sales",adminauth,adminController.filterSalesReport);

// offer management 
router.get("/offer",adminauth,offerController.loadOffer);
router.post("/add-product-offer",adminauth,offerController.addProductOffer);

// multer 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname,"../public/uploads/product-img");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });
// product management 
router.get("/loadproducts",adminauth,productsController.loadproducts);
router.get("/addProducts",adminauth,productsController.getaddProducts);
router.post("/addProduct",upload.array("images",3),adminauth,productsController.addProduct);
router.get("/editProduct",adminauth,productsController.loadEditProduct);
router.post("/editProduct",adminauth,upload.array("images",3),productsController.editProduct);
router.get("/deleteProduct",adminauth,productsController.deleteProduct);
router.get("/blockProduct",adminauth,productsController.blockProduct);
router.get("/unblockProduct",adminauth,productsController.unblockProduct);


  
module.exports = router ;