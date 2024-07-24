var express = require('express');
var router = express.Router();

var multer = require('multer');

const { RegisterSeller, verifyOTPSeller, LoginSeller, insertProduct, updateProduct, deleteProduct, getAllSellerProducts, getSellerProductsAndOrders, getAllCategoriesSeller, getAllSubcategoriesSeller, updateOrderStatus, countSellerProducts, countSellerOrders, validateToken, SellerData, UpdateSpecialProduct, ChangePwd } = require('../controller/Seller');

const {  uploadImage } = require('../controller/uploadController');

const storage = multer.diskStorage({
  destination : function(req,res,cd){
          cd(null , './public/images');
  },
  filename : function (req,file,cd){
      cd(null ,file.originalname);
  }
})

const upload = multer({storage : storage});

// User Register
router.post('/Signup',upload.single('brandLogo'),RegisterSeller);

// Verify-OTP
router.post('/VerifyOTP',verifyOTPSeller);

// Login Seller
router.post('/LoginSeller',LoginSeller);

// Add Product
router.post('/AddProduct', upload.array('images', 10), insertProduct);

// Update Product
router.patch('/UpdateProduct/:productId',upload.array('image',10),updateProduct);

// Delete Product
router.delete('/DeleteProduct/:productId',deleteProduct);

// Show All Orders Of Own Listing Product Wise
router.get('/AllProduct',getAllSellerProducts);

// Fetch All Order Data
router.get('/getSellerProductsAndOrders',getSellerProductsAndOrders);

// All Ctegory
router.get('/AllCategory',getAllCategoriesSeller);

// All Sub Category
router.get('/AllSubCategory/:categoryId',getAllSubcategoriesSeller);

// Change Order Status
router.patch('/UpdateStatus',updateOrderStatus);

// Total
router.get('/countSellerProducts',countSellerProducts);

// Total 
router.get('/countSellerOrders',countSellerOrders);

// Verify Token
router.get('/validateToken',validateToken);

// Seller Data
router.get('/SellerData',SellerData);

// Update Product One Only
router.get('/UpdateSpecialProduct/:productId',UpdateSpecialProduct);

// Upload Sigle Images
router.post('/UploadImage', upload.single('image'), uploadImage);

// Change Pwd
router.post('/ChangePwd',ChangePwd);


module.exports = router;
