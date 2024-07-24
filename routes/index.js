var express = require('express');
const { LoginUser, verifyOTP, getActiveProducts, getProductById, addCart, updateProductQuantityInCart , placeOrder, removeProductFromCart, UserData, getCartData, fetchUserOrders, ChangeOrderStatus, ChangePwdUser, AddNewUser, NewUsers } = require('../controller/User');
var router = express.Router();


var multer = require('multer');
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
router.post('/Signup',upload.single('profileImage'),NewUsers);

router.post('/ChangePwdUser',ChangePwdUser);
// OTP Verify
router.post('/verifyOTP',verifyOTP);

// Login
router.post('/LoginUser',LoginUser);

// Show ALL Products Data
router.get('/AllProducts',getActiveProducts);

// Show Single Product ByID
router.get('/Product/:productId',getProductById);

// Add To Cart
router.post('/addCart/:productId',addCart);

// Fecth all cart Data
router.get('/getCartData',getCartData);

// Update Product Qty
router.patch('/UpdateCart/:productId',updateProductQuantityInCart);

// Delete Product From Cart
router.delete('/DeleteProduct/:productId',removeProductFromCart);

// Place Order
router.post('/placeOrder',placeOrder);

// Valid User
router.get('/UserData',UserData);

// All Orders
router.get('/fetchUserOrders',fetchUserOrders);

// User Change Status
router.post('/ChangeOrderStatus/:orderId',ChangeOrderStatus);

module.exports = router;
