const User = require('../model/User');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Cart = require("../model/Cart");
const Order = require("../model/Order");
const Product = require("../model/Product");


// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "codewithdhruv715@gmail.com",
    pass: "rnbi ceco btbm txwh",
  },
});

// Function to generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.NewUsers = async (req, res) => {
  console.log("Runner Fun");
  try {
    const { name, email, password, mobileNumber, street, city, state, pinCode, country } = req.body;

    // Check if email already exists
    const checkEmail = await User.findOne({ email });

    if (checkEmail) {
      throw new Error('Email Already Exists');
    }

    const profileImage = req.file ? req.file.originalname : null;
    console.log(req.body);
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP and OTP expiry
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP expiry set to 15 minutes

    // Send OTP email with HTML content
    const mailOptions = {
      from: 'codewithdhruv715@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: black; color: #ffffff;">
          <div style="text-align: center;">
            <img src="https://your-logo-url.com" alt="Logo" style="width: 200px; margin-bottom: 20px;">
          </div>
          <h2 style="background-color: #4CAF50; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">Your OTP</h2>
          <p style="font-size: 16px; color: #cccccc;">
            Dear User,
            <br/><br/>
            Thank you for registering. To complete your registration, please use the following One Time Password (OTP):
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <strong style="font-size: 24px; color: #4CAF50;">${otp}</strong>
          </div>
          <p style="font-size: 16px; color: #cccccc;">
            This OTP is valid for 15 minutes. For security reasons, please do not share this OTP with anyone.
            <br/><br/>
            Welcome aboard!
            <br/><br/>
            Regards,
            <br/>
            The Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Create user with OTP details and address
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      profileImage,
      emailOTP: {
        code: otp,
        expiry: otpExpiry
      },
      addresses: [{
        street,
        city,
        state,
        pinCode,
        country
      }]
    });
    console.log(newUser);
    await newUser.save();
    // Save user to database

    // Return success response
    res.status(200).json({
      status: 'Success',
      message: 'New User Registered Successfully. OTP has been sent to your email.',
      // data: newUser
    });
  } catch (error) {
    res.status(401).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.emailOTP.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.emailOTP.expiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.emailOTP.verified = true;
    user.emailOTP.code = null; // Clear OTP after verification
    user.emailOTP.expiry = null;

    await user.save();

    res.status(200).json({
      status: "Success",
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error occurred",
      error: error.message,
    });
  }
};

// Login User
exports.LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const UserData = await User.findOne({ email });
    console.log(UserData);
    if (!UserData) {
      return res.status(400).json({ msg: "Email Does Not Exist" });
    }

    const isMatch = await bcrypt.compare(password, UserData.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Password" });
    }
    var token = await jwt.sign(UserData.id, "token");
    res.status(201).json({
      status: "Success",
      message: "User Login Successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error Occurred",
      error: error.message,
    });
  }
};

// Verify Token

exports.getData = async (req, res) => {
  const token = req.headers.auth;
  if (!token) {
    return res.status(401).json({
      status: "Failed",
      message: "Authorization token not provided",
    });
  }

  const decoded = jwt.verify(token, "token");
  console.log(decoded);
  const userId = decoded;
  var Data = await User.findById(userId);
  res.status(200).json({
    status: "Success",
    message: "Fetch Data Successfully",
    Data,
  });
};

// Fetch all Product Data
exports.getActiveProducts = async (req, res) => {
  try {
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: "Failed",
    //     message: "Authorization token not provided",
    //   });
    // }

    // const decoded = jwt.verify(token, "token");
    // const userId = decoded;

    // // Verify if the user exists
    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(404).json({
    //     status: "Failed",
    //     message: "User not found",
    //   });
    // }

    // Fetch all products with the status 'active'
    const activeProducts = await Product.find({ status: "active" });

    res.status(200).json({
      status: "Success",
      message: "Fetched active products successfully",
      data: activeProducts,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Fetch Specific Product by ID
exports.getProductById = async (req, res) => {
  try {
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: "Failed",
    //     message: "Authorization token not provided",
    //   });
    // }

    // const decoded = jwt.verify(token, "token");
    // const userId = decoded;

    // // Verify if the user exists
    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(404).json({
    //     status: "Failed",
    //     message: "User not found",
    //   });
    // }

    // Fetch the product by ID and ensure it has status 'active'
    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId, status: "active" });

    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found or not active",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Fetched product successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Add To Cart
exports.addCart = async (req, res) => {
  try {
    const token = req.headers.auth;

    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Authorization token not provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, "token");
    } catch (error) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid token",
        error: error.message,
      });
    }

    const userId = decoded;
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        status: "Failed",
        message: "Missing product details",
      });
    }

    // Fetch product details based on productId
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        products: [
          {
            productId,
            name: product.name,
            price: product.price,
            quantity,
            image: product.image[0] 
          },
        ],
      });
    } else {
      const existingProduct = cart.products.find(
        (product) => product.productId.toString() == productId
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({
          productId,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image[0] 
        });
      }
    }

    await cart.save();

    res.status(200).json({
      status: "Success",
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error occurred",
      error: error.message,
    });
  }
};

exports.getCartData = async (req, res) => {
  try {
    const token = req.headers.auth;

    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Authorization token not provided",
      });
    }

    const decoded = jwt.verify(token, "token");
    const userId = decoded;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        status: "Failed",
        message: "Cart not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error occurred",
      error: error.message,
    });
  }
};

// Remove Product From the Cart
exports.removeProductFromCart = async (req, res) => {
  try {
    const token = req.headers.auth;

    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Authorization token not provided",
      });
    }

    const decoded = jwt.verify(token, "token");
    const userId = decoded;
    const productId = req.params.productId;

    // Find the user's cart and remove the product
    const result = await Cart.updateOne(
      { userId: userId },
      { $pull: { products: { productId: productId } } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found in cart",
      });
    }

    // Recalculate total amount after removing the product
    const cart = await Cart.findOne({ userId });
    cart.calculateTotal(); // Recalculate total amount
    await cart.save();

    res.status(200).json({
      status: "Success",
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error occurred",
      error: error.message,
    });
  }
};

// Update Product Qty in Cart
exports.updateProductQuantityInCart = async (req, res) => {
  try {
    const token = req.headers.auth;

    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Authorization token not provided",
      });
    }

    const decoded = jwt.verify(token, "token");
    const userId = decoded;
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid quantity provided",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        status: "Failed",
        message: "Cart not found",
      });
    }

    const product = cart.products.find(
      (product) => product.productId.toString() === productId
    );

    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found in cart",
      });
    }

    product.quantity = quantity;
    product.subtotal = product.price * quantity; // Update the subtotal for the product

    await cart.save();

    // Recalculate total amount after updating quantity
    cart.calculateTotal(); // Recalculate total amount
    await cart.save();

    res.status(200).json({
      status: "Success",
      message: "Product quantity updated successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error occurred",
      error: error.message,
    });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Authorization token not provided",
      });
    }

    const decoded = jwt.verify(token, "token");
    const userId = decoded;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Find the cart for the user
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    // Check if the cart exists
    if (!cart) {
      return res.status(404).json({
        status: "Failed",
        message: "Cart not found for the user",
      });
    }

    // Create individual orders for each product in the cart
    const orders = [];
    for (const product of cart.products) {
      const order = new Order({
        userId: cart.userId,
        userEmail: user.email,
        productId: product.productId._id,
        name: product.productId.name,
        price: product.price,
        quantity: product.quantity,
        totalAmount: product.price * product.quantity,
        image: product.image // Ensure the image is added
      });

      await order.save();
      orders.push(order);

      // Decrement the product quantity
      const productToUpdate = await Product.findById(product.productId._id);
      if (productToUpdate) {
        productToUpdate.quantity -= product.quantity;
        await productToUpdate.save();
      }
    }

    // Clear the cart data for the user
    cart.products = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({
      status: "Success",
      message: "Orders placed successfully",
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
};


exports.UserData = async (req, res) => {
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
    const users = await User.findById(decoded);

    if (!users) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Invalid token or seller does not exist',
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Token is valid',
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.fetchUserOrders = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Authorization token not provided",
      });
    }

    const decoded = jwt.verify(token, "token");  
    const userId = decoded;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        status: "Failed",
        message: "No orders found for the user",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Orders fetched successfully",
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.ChangeOrderStatus = async (req, res) => {
  try {
    const token = req.headers.auth;
    console.log(token);
    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Authorization token not provided",
      });
    }

    const decoded = jwt.verify(token, "token");
    const userId = decoded; 
    console.log(userId);
    const orders = await Order.find({ userId });
    if (!orders.length) {
      return res.status(404).json({
        status: "Failed",
        message: "No orders found for the user",
      });
    }
    const { orderId } = req.params;
    const order =  orders.find(order => order._id.toString() === orderId);
    console.log(order);
    if (!order) {
      return res.status(404).json({
        status: "Failed",
        message: "Order not found",
      });
    }
    order.status = 'Cancelled';
    await order.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: "codewithdhruv715@gmail.com",
        pass: "rnbi ceco btbm txwh"
      }
    });

    const mailOptions = {
      from: "codewithdhruv715@gmail.com",
      to: order.userEmail, 
      subject: 'Order Cancelled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: black; color: #ffffff;">
          <div style="text-align: center;">
            <img src="https://i.pinimg.com/736x/47/b7/bd/47b7bdac4285ee24654ca7d68cf06351.jpg" alt="Amazon" style="width: 200px; margin-bottom: 20px; filter: brightness(150%);">
          </div>
          <h2 style="background-color: #4CAF50; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">Order Cancelled</h2>
          <p style="font-size: 16px; color: #cccccc;">
            Dear Customer,
            <br/><br/>
            Your order with ID <strong>${order._id}</strong> has been successfully cancelled.
            <br/><br/>
            If you have any questions or need further assistance, please contact our support team.
            <br/><br/>
            Regards,
            <br/>
            The Amazon Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: "Success",
      message: "Order cancelled successfully and email sent",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Change User Pwd

// Change Pwd
// Change Pwd
exports.ChangePwdUser = async (req, res) => {
  try {
    const token = req.headers.auth;
    const { currentPassword, newPassword } = req.body;

    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    const user = await User.findById(decoded);

    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Current password is incorrect',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

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
