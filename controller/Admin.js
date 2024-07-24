const Admin = require('../model/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Category = require('../model/Category');
const Subcategory = require('../model/SubCategory');
const nodemailer = require('nodemailer');
const Seller = require('../model/Sellers');
const User = require('../model/User');
const Order = require('../model/Order');
const Product = require('../model/Product');

exports.newAdmin = async (req,res) =>{
    try {
        const CheckEmail = await Admin.findOne({email  : req.body.email});
        if(CheckEmail){
            throw new Error('Email Already Exist');
        }
        else {

            req.body.password = await bcrypt.hash(req.body.password,12);
            var Data = await Admin.create(req.body)
            res.status(200).json({
                status : 'Success',
                message : 'New Admin Add Successfully',
                Data
            })
        }
    } catch (error) {
            res.status(401).json({
                status : 'Failed',
                message : error.message
            })
    }
}

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the admin exists
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Password' });
      }
      var token = await jwt.sign(admin.id,'token');
      res.status(201).json({
          status : 'Success',
          message : 'Admin Login Successfully',
          token
      });
    } catch (err) {
      res.status(401).json({
          status: 'Failed',
          message: 'Error Occured',
          error : err.message
      });
    }
  };

// Admin Add Category
exports.addCategory = async (req, res) => {
    try {
        // const token = req.headers.auth;
        // if (!token) {
        //   return res.status(401).json({
        //     status: 'Failed',
        //     message: 'Authorization token not provided',
        //   });
        // }
    
        // const decoded = jwt.verify(token, 'token'); 
        // const adminId = decoded;
    
        // // Find the admin based on the decoded ID
        // const admin = await Admin.findById(adminId);
        // if (!admin) {
        //   return res.status(404).json({
        //     status: 'Failed',
        //     message: 'Admin not found',
        //   });
        // }
    
        const { name, description } = req.body;
        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const categoryData = {
            name,
            description,
            image: req.file ? req.file.filename : null
        };

        const category = await Category.create(categoryData);

        res.status(201).json({ status:'Success',message: 'Category added successfully', category });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add category', error: error.message });
    }
  };  
  
  // Controller to update a category
  exports.updateCategory = async (req, res) => {
    try {
        // const token = req.headers.auth;
        // if (!token) {
        //   return res.status(401).json({
        //     status: 'Failed',
        //     message: 'Authorization token not provided',
        //   });
        // }
    
        // const decoded = jwt.verify(token, 'token'); 
        // const adminId = decoded;
    
        // // Find the admin based on the decoded ID
        // const admin = await Admin.findById(adminId);
        // if (!admin) {
        //     return res.status(404).json({
        //         status: 'Failed',
        //         message: 'Admin not found',
        //     });
        // }

        const categoryId = req.params.id;
        const updates = req.body;

        // Handle image update
        if (req.file) {
            updates.image = req.file.filename;
        }

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ status:'Success',message: 'Category updated successfully', category: updatedCategory });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update category', error: error.message });
    }
  };
  
  // Controller to delete a category
  exports.deleteCategory = async (req, res) => {
    try {
    // const token = req.headers.auth;
    //     if (!token) {
    //       return res.status(401).json({
    //         status: 'Failed',
    //         message: 'Authorization token not provided',
    //       });
    //     }
    
    //     const decoded = jwt.verify(token, 'token'); 
    //     const adminId = decoded;
    
    //     // Find the admin based on the decoded ID
    //     const admin = await Admin.findById(adminId);
    //     if (!admin) {
    //       return res.status(404).json({
    //         status: 'Failed',
    //         message: 'Admin not found',
    //       });
    //     }
    
      const categoryId = req.params.id;
  
      const deletedCategory = await Category.findByIdAndDelete(categoryId);
  
      if (!deletedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      res.status(200).json(
        {status:'Success' ,
        message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete category', error: error.message });
    }
  };

  // Add Sub Category
  exports.addSubcategory = async (req, res) => {
    try {
        // const token = req.headers.auth;
        // if (!token) {
        //     return res.status(401).json({
        //         status: 'Failed',
        //         message: 'Authorization token not provided',
        //     });
        // }

        // const decoded = jwt.verify(token, 'token'); 
        // const adminId = decoded; // Adjust based on your JWT payload

        // // Find the admin based on the decoded ID
        // const admin = await Admin.findById(adminId);
        // if (!admin) {
        //     return res.status(404).json({
        //         status: 'Failed',
        //         message: 'Admin not found',
        //     });
        // }

        const { name, description, category } = req.body;
        const existingSubcategory = await Subcategory.findOne({ name });

        if (existingSubcategory) {
            return res.status(400).json({ message: 'Subcategory already exists' });
        }

        const subcategoryData = {
            name,
            description,
            category,
            image: req.file ? req.file.filename : null
        };

        const subcategory = await Subcategory.create(subcategoryData);

        res.status(201).json({ status:'Success',message: 'Subcategory added successfully', subcategory });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add subcategory', error: error.message });
    }
};

// Update Subcategory
exports.updateSubcategory = async (req, res) => {
    try {
        // const token = req.headers.auth;
        // if (!token) {
        //     return res.status(401).json({
        //         status: 'Failed',
        //         message: 'Authorization token not provided',
        //     });
        // }

        // const decoded = jwt.verify(token, 'token'); 
        // const adminId = decoded; // Adjust based on your JWT payload

        // // Find the admin based on the decoded ID
        // const admin = await Admin.findById(adminId);
        // if (!admin) {
        //     return res.status(404).json({
        //         status: 'Failed',
        //         message: 'Admin not found',
        //     });
        // }

        const subcategoryId = req.params.id;
        const updates = req.body;

        // Handle image update
        if (req.file) {
            updates.image = req.file.filename;
        }

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(subcategoryId, updates, { new: true });

        if (!updatedSubcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        res.status(200).json({status:'Success', message: 'Subcategory updated successfully', subcategory: updatedSubcategory });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update subcategory', error: error.message });
    }
};

// Delete Subcategory
exports.deleteSubcategory = async (req, res) => {
    try {
        // const token = req.headers.auth;
        // if (!token) {
        //     return res.status(401).json({
        //         status: 'Failed',
        //         message: 'Authorization token not provided',
        //     });
        // }

        // const decoded = jwt.verify(token, 'token'); 
        // const adminId = decoded; // Adjust based on your JWT payload

        // // Find the admin based on the decoded ID
        // const admin = await Admin.findById(adminId);
        // if (!admin) {
        //     return res.status(404).json({
        //         status: 'Failed',
        //         message: 'Admin not found',
        //     });
        // }

        const subcategoryId = req.params.id;

        const deletedSubcategory = await Subcategory.findByIdAndDelete(subcategoryId);

        if (!deletedSubcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        res.status(200).json({ status:'Success',message: 'Subcategory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete subcategory', error: error.message });
    }
};

// Change Seller Status
// Setup Nodemailer transporter


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: "codewithdhruv715@gmail.com",
    pass: "rnbi ceco btbm txwh"
  }
});

// Admin updates seller status
exports.updateSellerStatus = async (req, res) => {
  try {
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: 'Failed',
    //     message: 'Authorization token not provided',
    //   });
    // }

    // const decoded = jwt.verify(token, 'token'); 
    // const adminId = decoded; // Adjust based on your JWT payload

    // // Find the admin based on the decoded ID
    // const admin = await Admin.findById(adminId);
    // if (!admin) {
    //   return res.status(404).json({
    //     status: 'Failed',
    //     message: 'Admin not found',
    //   });
    // }

    const { status } = req.body;
    const sellerId = req.params.id;
    const validStatuses = ['under process', 'approved', 'deactivate', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.status = status;
    await seller.save();

    if (status === 'deactivate') {
      // Update all products of the seller to inactive
      await Product.updateMany({ seller: sellerId }, { status: 'deactivate' });
    }

    let emailContent;

    switch (status) {
      case 'approved':
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: black; color: #ffffff;">
            <div style="text-align: center;">
              <img src="https://i.pinimg.com/736x/47/b7/bd/47b7bdac4285ee24654ca7d68cf06351.jpg" alt="Amazon" style="width: 200px; margin-bottom: 20px; filter: brightness(150%);">
            </div>
            <h2 style="background-color: #4CAF50; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">Congratulations!</h2>
            <p style="font-size: 16px; color: #cccccc;">
              Dear Seller,
              <br/><br/>
              Congratulations on becoming a seller with us at Amazon. Your profile has been approved by the Amazon Seller Team.
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
        break;
      case 'rejected':
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: black; color: #ffffff;">
            <div style="text-align: center;">
              <img src="https://i.pinimg.com/736x/47/b7/bd/47b7bdac4285ee24654ca7d68cf06351.jpg" alt="Amazon" style="width: 200px; margin-bottom: 20px; filter: brightness(150%);">
            </div>
            <h2 style="background-color: #FF5733; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">Profile Rejected</h2>
            <p style="font-size: 16px; color: #cccccc;">
              Dear Seller,
              <br/><br/>
              We regret to inform you that your seller profile has been rejected by the Amazon Seller Team. 
            </p>
            <p style="font-size: 16px; color: #cccccc;">
              If you have any questions or need further assistance, please contact our support team.
              <br/><br/>
              Regards,
              <br/>
              The Amazon Team
            </p>
          </div>
        `;
        break;
      case 'deactivate':
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: black; color: #ffffff;">
            <div style="text-align: center;">
              <img src="https://i.pinimg.com/736x/47/b7/bd/47b7bdac4285ee24654ca7d68cf06351.jpg" alt="Amazon" style="width: 200px; margin-bottom: 20px; filter: brightness(150%);">
            </div>
            <h2 style="background-color: #FFC300; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">Account Deactivated</h2>
            <p style="font-size: 16px; color: #cccccc;">
              Dear Seller,
              <br/><br/>
              Your seller account has been deactivated by the Amazon Seller Team.
            </p>
            <p style="font-size: 16px; color: #cccccc;">
              If you believe this is a mistake or have any questions, please contact our support team.
              <br/><br/>
              Regards,
              <br/>
              The Amazon Team
            </p>
          </div>
        `;
        break;
      case 'under process':
      default:
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: black; color: #ffffff;">
            <div style="text-align: center;">
              <img src="https://i.pinimg.com/736x/47/b7/bd/47b7bdac4285ee24654ca7d68cf06351.jpg" alt="Amazon" style="width: 200px; margin-bottom: 20px; filter: brightness(150%);">
            </div>
            <h2 style="background-color: #4CAF50; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">Application Under Process</h2>
            <p style="font-size: 16px; color: #cccccc;">
              Dear Seller,
              <br/><br/>
              Your application is currently under process. We will complete the verification within the next 48 hours. You will receive an email confirmation once the process is complete.
            </p>
            <p style="font-size: 16px; color: #cccccc;">
              Regards,
              <br/>
              The Amazon Team
            </p>
          </div>
        `;
        break;
    }

    await transporter.sendMail({
      from: "codewithdhruv715@gmail.com",
      to: seller.email,
      subject: `Seller Status Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: emailContent
    });

    res.status(200).json({ status: 'Success',message: 'Seller status updated successfully', seller });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update seller status', error: error.message });
  }
};


// Admin Manage Users
exports.AllUsers = async (req, res) => {
  try {
      // const token = req.headers.auth;
      // if (!token) {
      //     return res.status(401).json({
      //         status: 'Failed',
      //         message: 'Authorization token not provided',
      //     });
      // }

      // const decoded = jwt.verify(token, 'token'); 
      // const adminId = decoded; // Adjust based on your JWT payload

      // // Find the admin based on the decoded ID
      // const admin = await Admin.findById(adminId);
      // if (!admin) {
      //     return res.status(404).json({
      //         status: 'Failed',
      //         message: 'Admin not found',
      //     });
      // }
       // Fetch all users from the database
    const users = await User.find();
    // Return the users and operations to the client
    res.status(200).json({
      status: 'Success',
      data: users
    });

    
  } catch (error) {
      res.status(500).json({ message: 'Failed to update subcategory', error: error.message });
  }
};

// All Order Data
exports.AllOrders = async (req, res) => {
  try {
    // Extract token from headers
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: 'Failed',
    //     message: 'Authorization token not provided',
    //   });
    // }

    // // Verify token
    // const decoded = jwt.verify(token, 'token'); 
    // const adminId = decoded; 

    // // Find the admin based on the decoded ID
    // const admin = await Admin.findById(adminId);
    // if (!admin) {
    //   return res.status(404).json({
    //     status: 'Failed',
    //     message: 'Admin not found',
    //   });
    // }

    // Fetch all orders from the database
    const orders = await Order.find();

    // Return the orders to the client
    res.status(200).json({
      status: 'Success',
      data: orders
    });

  } catch (error) {
    // Handle any errors
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// All Product Data
exports.AllProduct = async (req, res) => {
  try {
    // Extract token from headers
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: 'Failed',
    //     message: 'Authorization token not provided',
    //   });
    // }

    // // Verify token
    // const decoded = jwt.verify(token, 'token'); 
    // const adminId = decoded; 

    // // Find the admin based on the decoded ID
    // const admin = await Admin.findById(adminId);
    // if (!admin) {
    //   return res.status(404).json({
    //     status: 'Failed',
    //     message: 'Admin not found',
    //   });
    // }

    // Fetch all orders from the database
    const product = await Product.find();

    // Return the orders to the client
    res.status(200).json({
      status: 'Success',
      data: product
    });

  } catch (error) {
    // Handle any errors
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Change Product Status
exports.changeProductStatus = async (req, res) => {
  try {
    // Extract token from headers
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: 'Failed',
    //     message: 'Authorization token not provided',
    //   });
    // }

    // // Verify token
    // const decoded = jwt.verify(token, 'token');
    // const adminId = decoded;

    // // Find the admin based on the decoded ID
    // const admin = await Admin.findById(adminId);
    // if (!admin) {
    //   return res.status(404).json({
    //     status: 'Failed',
    //     message: 'Admin not found',
    //   });
    // }

    // Extract product ID from URL parameters and status from request body
    const { productId } = req.params;
    const { status } = req.body;

    // Validate the status
    const validStatuses = ['under review', 'active', 'deactivate'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Invalid status',
      });
    }

    // Find the product by ID and update its status
    const product = await Product.findByIdAndUpdate(productId, { status: status }, { new: true });

    if (!product) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Product not found',
      });
    }

    // Return the updated product to the client
    res.status(200).json({
      status: 'Success',
      data: product
    });

  } catch (error) {
    // Handle any errors
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get allSub category
exports.getAllSubcategories = async (req, res) => {
  try {
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: 'Failed',
    //     message: 'Authorization token not provided',
    //   });
    // }

    // // Verify token
    // const decoded = jwt.verify(token, 'token');
    // const adminId = decoded;

    // // Find the admin based on the decoded ID
    // const admin = await Admin.findById(adminId);
    // if (!admin) {
    //   return res.status(404).json({
    //     status: 'Failed',
    //     message: 'Admin not found',
    //   });
    // }
    const subcategories = await Subcategory.find().populate('category', 'name');

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

// All Category
exports.getAllCategories = async (req, res) => {
  try {
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: 'Failed',
    //     message: 'Authorization token not provided',
    //   });
    // }

    // // Verify token
    // const decoded = jwt.verify(token, 'token');
    // const adminId = decoded;

    // // Find the admin based on the decoded ID
    // const admin = await Admin.findById(adminId);
    // if (!admin) {
    //   return res.status(404).json({
    //     status: 'Failed',
    //     message: 'Admin not found',
    //   });
    // }
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

// All Seller
exports.AllSellers = async (req, res) => {
  try {
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: 'Failed',
    //     message: 'Authorization token not provided',
    //   });
    // }

    // const decoded = jwt.verify(token, 'token');
    // const adminId = decoded;

    // // Find the admin based on the decoded ID
    // const admin = await Admin.findById(adminId);
    // if (!admin) {
    //   return res.status(404).json({
    //     status: 'Failed',
    //     message: 'Admin not found',
    //   });
    // }

    // Fetch all sellers from the database
    const sellers = await Seller.find();

    // Return the sellers to the client
    res.status(200).json({
      status: 'Success',
      data: sellers,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Failed to fetch sellers',
      error: error.message,
    });
  }
};

exports.validateTokenAdmin = async (req, res) => {
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
    const admin = await Admin.findById(decoded);

    if (!admin) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Invalid token or seller does not exist',
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Token is valid',
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

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
  var Data = await Admin.findById(userId);
  res.status(200).json({
    status: "Success",
    message: "Fetch Data Successfully",
    Data,
  });
};