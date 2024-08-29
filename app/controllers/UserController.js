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

const UserController = {
    registerUser: [
        // Validation rules
        check('first_name').not().isEmpty().withMessage('Name is required'),
        check('email').isEmail().withMessage('Invalid email'),
        check('phone').isMobilePhone().withMessage('Invalid phone number'),
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
                const { first_name, last_name, password, email, phone, designation, userType, organization_id } = req.body;

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create the user object
                const user = new User({
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone: phone,
                    password: hashedPassword,
                    designation: designation,
                    role: userType,
                    organization_id: (organization_id) ? organization_id : null
                });

                // Save the user to the database
                let response = await user.save();

                return res.status(201).json({
                    user: response,
                    message: 'User registered successfully',
                });

            } catch (error) {
                // Handle duplicate email/phone error
                if (error.code === 11000) {
                    if (error.keyPattern && error.keyPattern.email) {
                        return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
                    } else if (error.keyPattern && error.keyPattern.phone) {
                        return res.status(400).json({ errors: [{ msg: 'Phone number already exists' }] });
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
                .populate('role', 'type') // Populate the role field as well
                .sort({ createdAt: -1 }); // Sort by creation date in descending order
              

            res.status(200).json({
                status: 'success',
                users: users,
            });

        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = UserController;
