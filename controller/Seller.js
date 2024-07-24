const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Order = require('../model/Order');
const Product = require('../model/Product');
const Category = require('../model/Category');
const Subcategory = require('../model/SubCategory');
const Seller = require('../model/Sellers');

var transporter
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.RegisterSeller = async (req, res) => {
  try {
    const { name, email, password, storeName, storeDescription, gstNumber, address, contactNumber } = req.body;
    const existingSellerByEmail = await Seller.findOne({ email });
    const existingSellerByStoreName = await Seller.findOne({ storeName });
    const existingSellerByGstNumber = await Seller.findOne({ gstNumber });

    if (existingSellerByEmail) {
      throw new Error('Email already exists');
    }

    if (existingSellerByStoreName) {
      throw new Error('Store name already exists');
    }

    if (existingSellerByGstNumber) {
      throw new Error('GST number already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const brandLogo = req.file ? req.file.originalname : null; 
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); 

    transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "codewithdhruv715@gmail.com",
        pass: "rnbi ceco btbm txwh",
      },
    });

    const mailOptions = {
      from: "codewithdhruv715@gmail.com",
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: black; color: #ffffff;">
          <div style="text-align: center;">
            <img src="https://i.pinimg.com/736x/47/b7/bd/47b7bdac4285ee24654ca7d68cf06351.jpg" alt="Amazon" style="width: 200px; margin-bottom: 20px; filter: brightness(150%);">
          </div>
          <h2 style="background-color: #4CAF50; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">Your OTP</h2>
          <p style="font-size: 16px; color: #cccccc;">
            Dear Seller,
            <br/><br/>
            Thank you for choosing to partner with us at Amazon. To complete your registration, please use the following One Time Password (OTP):
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <strong style="font-size: 24px; color: #4CAF50;">${otp}</strong>
          </div>
          <p style="font-size: 16px; color: #cccccc;">
            This OTP is valid for 15 minutes. For security reasons, please do not share this OTP with anyone.
            <br/><br/>
            We are excited to have you onboard and look forward to helping you grow your business.
            <br/><br/>
            Regards,
            <br/>
            The Amazon Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    const seller = new Seller({
      name,
      email,
      password: hashedPassword,
      storeName,
      brandLogo,
      storeDescription,
      gstNumber,
      address,
      contactNumber,
      emailOTP: {
        code: otp,
        expiry: otpExpiry
      }
    });

    await seller.save();
    res.status(200).json({
      status: 'Success',
      message: 'New Seller Registered Successfully. OTP has been sent to your email.',
      data: seller
    });

  } 
  catch (error) {
    console.log('Error during seller registration:', error.message);
    res.status(401).json({
      status: 'Failed',
      message: error.message || 'Internal Server Error'
    });
  }
};

// Verify OTP
const sendEmail = async (email, subject, htmlContent) => {
  const mailOptions = {
    from: "codewithdhruv715@gmail.com",
    to: email,
    subject: subject,
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
};

exports.verifyOTPSeller = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(`Verifying OTP for email: ${email}, provided OTP: ${otp}`);

    const seller = await Seller.findOne({ email });

      if (!seller) {
      console.log('Seller not found');
      return res.status(400).json({ message: 'Seller not found' });
    }

    console.log(`Seller found: ${seller}`);
    console.log(`Stored OTP: ${seller.emailOTP.code}, OTP expiry: ${seller.emailOTP.expiry}`);

    if (seller.emailOTP.code !== otp) {
      console.log('Invalid OTP');
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (seller.emailOTP.expiry < Date.now()) {
      console.log('OTP has expired');
      return res.status(400).json({ message: 'OTP has expired' });
    }


    seller.emailOTP.verified = true;
    seller.emailOTP.code = null; 
    seller.emailOTP.expiry = null;

    await seller.save();

    // Send confirmation email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: black; color: #ffffff;">
        <div style="text-align: center;">
          <img src="https://i.pinimg.com/736x/47/b7/bd/47b7bdac4285ee24654ca7d68cf06351.jpg" alt="Amazon" style="width: 200px; margin-bottom: 20px; filter: brightness(150%);">
        </div>
        <h2 style="background-color: #4CAF50; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">Congratulations!</h2>
        <p style="font-size: 16px; color: #cccccc;">
          Dear Seller,
          <br/><br/>
          Congratulations on becoming a seller with us at Amazon. Your application is currently under process and we will complete the verification within the next 48 hours. You will receive an email confirmation once the process is complete.
        </p>
        <p style="font-size: 16px; color: #cccccc;">
          We are excited to have you onboard and look forward to helping you grow your business.
          <br/><br/>
          Regards,
          <br/>
          The Amazon Team
        </p>
      </div>
    `;

    await sendEmail(email, 'Seller Registration Successful', emailContent);

    res.status(200).json({
      status: 'Success',
      message: 'OTP verified successfully and confirmation email sent'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      status: 'Failed',
      error: error.message
    });
  }
};

  // Login Seller
exports.LoginSeller = async (req, res) => {
    try {
      const { email, password } = req.body;
      const sellerData = await Seller.findOne({ email });
      console.log(sellerData);
      if (!sellerData) {
        return res.status(400).json({ msg: 'Email Does Not Exist' });
      }
  
      const isMatch = await bcrypt.compare(password, sellerData.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Password' });
      }
      var token = await jwt.sign(sellerData.id , 'token');
      res.status(201).json({
        status: 'Success',
        message: 'Seller Login Successfully',
        sellerData,
        token
      });
    } catch (error) {
      res.status(500).json({
        status: 'Failed',
        message: 'Error Occurred',
        error: error.message
      });
    }
}

// Add Product
exports.insertProduct = async (req, res) => {
    try {
      const token = req.headers.auth;
      if (!token) {
        return res.status(401).json({
          status: 'Failed',
          message: 'Authorization token not provided',
        });
      }
  
      const decoded = jwt.verify(token, 'token'); 
      const sellerId = decoded; 
      let images = [];
      if (req.files) {
        images = req.files.map(file => file.originalname); // Or file.path if you're storing the full path
      }
  
      const { name, price, quantity, description, category, subcategory, features } = req.body;
  
      const newProduct = new Product({
        name,
        image: images, // Include the images array
        price,
        quantity,
        description,
        category,
        subcategory,
        features,
        seller: sellerId,
      });
  
      const savedProduct = await newProduct.save();
  
      res.status(201).json({
        status: 'Success',
        message: 'Product added successfully',
        data: savedProduct,
      });
    } catch (error) {
      res.status(500).json({
        status: 'Failed',
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
  

// All One Prduct Data For Update Product
exports.UpdateSpecialProduct = async (req,res)=>{
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    const sellerId = decoded;

    const { productId } = req.params;
    const updateData = req.body;

    
    if (req.files) {
      const newImages = req.files.map(file => file.originalname); 
      updateData.image = newImages;
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, seller: sellerId },
      { $set: updateData },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Product not found or not authorized',
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
}

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    const sellerId = decoded;

    const { productId } = req.params;
    const updateData = req.body;

    
    if (req.files) {
      const newImages = req.files.map(file => file.originalname); 
      updateData.image = newImages;
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, seller: sellerId },
      { $set: updateData },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Product not found or not authorized',
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    const sellerId = decoded;

    const { productId } = req.params;

    const product = await Product.findOneAndDelete({ _id: productId, seller: sellerId });

    if (!product) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Product not found or not authorized',
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Fetch All Product
exports.getAllSellerProducts = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    const sellerId = decoded; 

    const products = await Product.find({ seller: sellerId });

    res.status(200).json({
      status: 'Success',
      message: 'Fetched products successfully',
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.getSellerProductsAndOrders = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    const sellerId = decoded;

    // Fetch all products listed by the seller
    const products = await Product.find({ seller: sellerId }, '_id');
    const productIds = products.map(product => product._id);

    // Fetch orders associated with the seller's products
    const orders = await Order.find({ productId: { $in: productIds } })
      .populate({
        path: 'userId',
        select: 'name mobileNumber addresses'
      })
      .populate({
        path: 'productId',
        select: 'name price'
      });

    // Prepare response data
    const orderDetails = orders.map(order => ({
      orderId: order._id,
      product: {
        _id: order.productId._id,
        name: order.productId.name,
        price: order.productId.price
      },
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      status: order.status,
      orderDate: order.orderDate,
      user: {
        _id: order.userId._id,
        name: order.userId.name,
        mobileNumber: order.userId.mobileNumber,
        addresses: order.userId.addresses
      }
    }));

    res.status(200).json({
      status: 'Success',
      message: 'Fetched orders successfully',
      data: orderDetails,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

exports.getAllSubcategoriesSeller = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({ category: categoryId }).populate('category', 'name');

    if (subcategories.length === 0) {
      return res.status(404).json({
        status: 'Failed',
        message: 'No subcategories found',
      });
    }

    res.status(200).json({
      status: 'Success',
      subcategories,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Failed to fetch subcategories',
      error: error.message,
    });
  }
};


// Get all categories
exports.getAllCategoriesSeller = async (req, res) => {
  try {
    const categories = await Category.find();

    if (categories.length === 0) {
      return res.status(404).json({
        status: 'Failed',
        message: 'No categories found',
      });
    }

    res.status(200).json({
      status: 'Success',
      categories,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;
    const token = req.headers.auth;

    // Check if token is provided
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    // Verify token and get sellerId
    const decoded = jwt.verify(token, 'token');
    const sellerId = decoded;

    // Find the order by orderId
    const order = await Order.findById(orderId);

    // Check if order exists and if it belongs to the current seller
    if (!order ) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Order not found or unauthorized',
      });
    }

    // Update the order status
    order.status = newStatus;
    await order.save();

    res.status(200).json({
      status: 'Success',
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

exports.countSellerProducts = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    const sellerId = decoded;

    // Count products listed by the seller
    const productCount = await Product.countDocuments({ seller: sellerId });

    res.status(200).json({
      status: 'Success',
      message: 'Counted products listed by the seller',
      data: productCount,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.countSellerOrders = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    const sellerId = decoded;

    // Fetch all products listed by the seller
    const products = await Product.find({ seller: sellerId }, '_id');
    const productIds = products.map(product => product._id);

    // Count orders associated with the seller's products
    const orderCount = await Order.countDocuments({ productId: { $in: productIds } });

    res.status(200).json({
      status: 'Success',
      message: 'Counted orders associated with the seller',
      data: orderCount,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Token Verify
exports.validateToken = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    console.log(decoded);
    const seller = await Seller.findById(decoded);

    if (!seller) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Invalid token or seller does not exist',
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Token is valid',
      data: seller,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Seller Data
exports.SellerData = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    console.log(decoded);
    const seller = await Seller.findById(decoded);

    if (!seller) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Invalid token or seller does not exist',
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Token is valid',
      data: seller,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Change Pwd
exports.ChangePwd = async (req, res) => {
  try {
    const token = req.headers.auth;
    const { currentPassword, newPassword } = req.body;
    console.log(req.body);
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); // Ensure 'token' matches your JWT secret
    const seller = await Seller.findById(decoded);

    if (!seller) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Seller not found',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, seller.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Current password is incorrect',
      });
    }

    seller.password = await bcrypt.hash(newPassword, 12);
    await seller.save();

    res.status(200).json({
      status: 'Success',
      message: 'Password changed successfully',
    });

  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};
