var express = require('express');
// const { newAdmin, loginAdmin, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory, updateSellerStatus, AllUsers, AllOrders, AllProduct, changeProductStatus, getAllSubcategories, getAllCategories, AllSellers, validateTokenAdmin, getData } = require('../controller/Admin');
var router = express.Router();

var multer = require('multer');
// const { NewUsers, getData } = require('../controller/User');
const { newAdmin, loginAdmin, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory, updateSellerStatus, AllUsers, AllOrders, AllProduct, getAllSubcategories, getAllCategories, AllSellers, changeProductStatus, validateTokenAdmin, getData } = require('../controller/Admin');


const storage = multer.diskStorage({
  destination : function(req,res,cd){
          cd(null , './public/images');
  },
  filename : function (req,file,cd){
      cd(null ,file.originalname);
  }
})


const upload = multer({storage : storage});

// Add New Admin
router.post('/AddNewAdmin',newAdmin);

// Login Admin
router.post('/Login',loginAdmin);

// Add Category
router.post('/addCategory',upload.single('image'),addCategory);

// Update Category
router.patch('/UpdateCategory/:id',upload.single('image'),updateCategory);

// Delete category
router.delete('/DeleteCategory/:id',deleteCategory);

// Add Sub Category
router.post('/addSubcategory', upload.single('image'), addSubcategory);

// Update Category
router.put('/updateSubcategory/:id', upload.single('image'), updateSubcategory);

// Delete Category
router.delete('/deleteSubcategory/:id', deleteSubcategory);

// Manage Seller Status
router.post('/updateSellerStatus/:id',updateSellerStatus);

// All User Data 
router.get('/AllUsers',AllUsers);

// All Order Data
router.get('/AllOrders',AllOrders);

// Fetch All Product Data
router.get('/AllProduct',AllProduct);

// Fetch All Sub-Category
router.get('/SubCategory',getAllSubcategories);

// Fetch All Category
router.get('/Category',getAllCategories);

// Fetch All Admin
router.get('/AllSellers',AllSellers);

// Manage Product for Status Changes
router.patch('/ChangeProduct/:productId',changeProductStatus);

// Verify Token Admin 
router.get('/validateTokenAdmin',validateTokenAdmin);

//Admin Data
router.get('/getData',getData);

module.exports = router;
