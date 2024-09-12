const User = require('../models/User.js');
const Role = require('../models/Role.js');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const expressFileupload = require('express-fileupload')
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uploadPath = path.join(__dirname, 'profile-pics');
const fs = require('fs');
const encryption = require("../utility/encryption");
const { sendResetEmail } = require('../../emailService');

const { sendEmail } = require('../../emails/sendEmail');
const crypto = require('crypto');



const UserController = {
    registerUser: [
        // Validation rules
        check('first_name').not().isEmpty().withMessage('Name is required'),
        check('email').isEmail().withMessage('Invalid email'),
        check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
        check('userType').not().isEmpty().withMessage('User type is required'),
        // Controller logic
        async (req, res) => {
            // Validate incoming request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            try {
                const { first_name, last_name, password, email, designation, userType, organization_id,created_by=null } = req.body;

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create the user object
                const user = new User({
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: hashedPassword,
                    designation: designation,
                    role: userType,
                    created_by:created_by,
                    organization_id: (organization_id) ? organization_id : null
                });

                // Save the user to the database
                let response = await user.save();

                if (response?._id) {
                    const role = await Role.findById(userType);
                    if (role?.type == "manager") {
                        let url =   `${process.env.FRONT_END_URL}/start-survey?token=`+response?._id
                        // let emailRes = await sendSurveyCreationEmail(response?.email, url,role?.type);

                        let email = response?.email
                        let roles=role?.type
                        let emailcred = await sendEmail('sendCredentialMail', { email, first_name,last_name,password})
                        let emailRes = await sendEmail('sendSurveyCreationEmail', { email, url,roles});
                    }
                    
                }
                return res.status(201).json({
                    user: response,
                    message: 'User registered successfully',
                });

            } catch (error) {
                // Handle duplicate email/phone error
                if (error.code === 11000) {
                    if (error.keyPattern && error.keyPattern.email) {
                        return res.status(400).json({ errors:{ email: 'Email already exists' } });
                    } else if (error.keyPattern && error.keyPattern.phone) {
                        return res.status(400).json({ errors:{ phone: 'Phone number already exists' } });
                    }
                }

                // Handle any other errors
                return res.status(500).json({ error: 'Internal Server Error', "errors": error });
            }
        }
    ],
    loginUser: async (req, res) => {
        const {
            email,
            password
        } = req.body;
        try {
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email and password are required'
                });
            }
            const user = await User.where('email', email).findOne();

            if (!user) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }
            const role = await Role.findById(user.role);

            //const token = await encryption.encrypt(user.id);

            return res.status(200).json({
                status: 'success',
                token: user.id, //token.iv + "." + token.encryptedData,
                user: {
                    id: user.id,
                    email: user.email,
                    last_name: user.last_name,
                    first_name: user.first_name,
                    role: role ? role.type : null
                }
            });

        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: "Invalid credentials"
            });
        }
    },
    fetchUsers: async (req, res) => {
        try {
            // Extract search parameters and pagination parameters from request
            const { searchTerm, page = 1, pageSize = 8 } = req.query;

            // Construct the query object for User.find() based on search term
            const query = {};
            if (searchTerm) {
                query.$or = [
                    { first_name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by username
                    { last_name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by username
                    { email: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by email
                    { phone: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by email
                ];
            }

            // Calculate the skip value to paginate results
            const skip = (page - 1) * pageSize;

            // Fetch users based on the constructed query and pagination parameters
            const users = await User.find(query)
                .populate({
                    path: 'organization_id',
                    select: 'name', // Exclude the __v field from the populated organization documents
                })
                .populate('role', '-__v') // Populate the role field as well
                .sort({ createdAt: -1 }) // Sort by creation date in descending order
                .skip(skip) // Skip documents for pagination
                .limit(parseInt(pageSize)); // Limit the number of documents per page


            const userCount = await User.countDocuments(query);

            res.status(200).json({
                status: 'success',
                count: userCount,
                users: users,
                totalPages: Math.ceil(userCount / pageSize), // Calculate total pages based on total users and page size
                currentPage: parseInt(page), // Set current page
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    deleteUsers: async (req, res) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ status: 'success', message: 'User deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    showUser: async (req, res) => {
        try {
            let { id } = req.params;
            let {token} = req.query;

            if (token){
                // let arr = id.split('.');
                // let obj = {
                //     iv: arr[0],
                //     encryptedData: arr[1],
                // }

                // id = await encryption.decrypt(obj);
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const role = await Role.findById(user.role);

            // Exclude sensitive fields like password from the response
            const { _id, first_name,last_name, email, phone, organization_id, createdAt, updatedAt } = user;
            res.status(200).json({
                _id,
                first_name,
                last_name,
                email,
                phone,
                role: role ? role.type : null,
                organization_id,
                createdAt,
                updatedAt
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ error: 'Internal Server Error', error });
        }
    },
    updateUser: async (req, res) => {
        const userId = req.params.id;
        const { first_name, last_name, email, phone, userType, organization_id } = req.body;
        var uniqueFilename = '';
        try {
            // Find the user by ID
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (req.files && req.files.length > 0) {
                if (user.image) {
                    const prevImagePath = path.join(__dirname, '../../public/employee-pics', user.image);
                    fs.unlink(prevImagePath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error('Error removing previous image:', unlinkErr);
                        }
                    });
                }
                const uploadedFile = req.files;
                uniqueFilename = uuidv4() + path.extname(uploadedFile[0].originalname);
                console.log(uploadedFile[0].buffer, uploadedFile[0].originalname);
                fs.writeFile(path.join(__dirname, '../../public/employee-pics', uniqueFilename), uploadedFile[0].buffer, (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        return res.status(500).json({ message: err });
                    }
                });
            } else {
                if (user.image) {
                    uniqueFilename = user.image;
                }
            }
            user.first_name = first_name;
            user.last_name = last_name;
            user.email = email;
            user.phone = phone;
            user.organization_id = (organization_id) ? organization_id : null;
            user.role = userType;
            await user.save();

            res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
            // Handle errors
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getLoopLeads: async (req, res) => {
        try {
            // Extract search parameters and pagination parameters from request
            const { searchTerm ,type} = req.query;

            // Construct the query object for User.find() based on search term
            const role = await Role.findOne({ type: type });
      
            const query = {organization_id : req.params.org_id, role: role._id};

      
            if (searchTerm) {
                query.$or = [
                    { first_name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by first_name
                    { last_name: { $regex: searchTerm, $options: 'i' } },  // Case-insensitive search by last_name
                    { email: { $regex: searchTerm, $options: 'i' } },      // Case-insensitive search by email
                    { phone: { $regex: searchTerm, $options: 'i' } },      // Case-insensitive search by phone
                ];
            }
    
            

            // Fetch users based on the constructed query and pagination parameters
            const users = await User.find(query)
                .populate({
                    path: 'organization_id',
                    select: 'name', // Exclude the __v field from the populated organization documents
                })
                .populate('role', 'type')
                .populate('created_by', 'first_name last_name email phone') // Populate the role field as well
                // Populate the role field as well
                .sort({ createdAt: -1 }); // Sort by creation date in descending order
              

            res.status(200).json({
                status: 'success',
                users: users,
            });

        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getLoopLeadsUserByOrgId: async (req, res) => {
        try {
            // Extract search parameters and pagination parameters from request
            const { user_id ,org_id} = req.params;

            const query = {
                _id:user_id,
                organization_id: org_id,
            };

            

            // Fetch users based on the constructed query and pagination parameters
            const user = await User.findOne(query)
                .populate({
                    path: 'organization_id',
                    select: 'name', // Exclude the __v field from the populated organization documents
                })
                .populate('role', 'type')
                .populate('created_by', 'first_name last_name email phone') // Populate the role field as well
                .sort({ createdAt: -1 }); // Sort by creation date in descending order
              

            res.status(200).json({
                status: true,
                user: user,
            });

        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        
    },
    forgetPassword: async (req, res) => {
        const { email } = req.body;

        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ error: 'Email not found' });
            }

            const token = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

            await user.save();
           let emailRes = await sendResetEmail(user.email, token);

            res.status(200).json({ status:true, message: 'Password reset email sent' ,emailRes:emailRes });
        } catch (error) {
            console.error('Error handling forgot password:', error);
            res.status(500).json({ message: error });
        }
    },
    resetPassword: async (req, res) => {
        const { token, newPassword } = req.body;

        try {
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() } // Ensure token has not expired
            });

            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired token' });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            user.resetPasswordToken = undefined; // Clear the token
            user.resetPasswordExpires = undefined; // Clear the expiry time

            await user.save();

            res.status(200).json({status:true, message: 'Password has been reset successfull' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = UserController;
