const User = require('../models/User.js');
const Role = require('../models/Role.js');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const Survey = require('../models/Survey');

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { sendResetEmail } = require('../../emailService');

const { sendEmail } = require('../../emails/sendEmail');
const crypto = require('crypto');

const UserController = {
    registerUser: [
        // Validation rules
        check('first_name').not().isEmpty().withMessage('Name is required'),
        check('email').isEmail().withMessage('Invalid email'),
        check('user_type').not().isEmpty().withMessage('User type is required'),
        // Controller logic
        async (req, res) => {
            // Validate incoming request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            try {
                const { first_name, last_name, email, designation, user_type, organization_id, phone, password, created_by = null } = req.body;

                // Hash the password

                // Create the user object
                const obj = {
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone: phone,
                    designation: designation,
                    role: user_type,
                    password: (password != undefined && password != "") ? await bcrypt.hash(password, 10) : null,
                    created_by: created_by,
                    organization: (organization_id) ? organization_id : null
                };

                try {

                    const user = new User(obj);

                    // Save the user to the database
                    let response = await user.save();

                    if (response?._id) {

                        const role = await Role.findById(user_type);

                        if (role?.type == "manager") {
                            let url = `${process.env.ADMIN_PANEL}/manager/surveys/create`
                            let admin_panel_url = `${process.env.ADMIN_PANEL}/create-password?token=${response?._id}`;

                            let email = response?.email
                            let last_name = response?.last_name
                            let first_name = response?.first_name

                            let roles = role?.type
                            sendEmail('createPasswordMail', { email, first_name, last_name, admin_panel_url })
                            sendEmail('sendSurveyCreationEmail', { email, url, roles });
                        }

                    }
                    return res.status(201).json({
                        user: response,
                        message: 'User Registered successfully',
                    });

                } catch (err) {
                    if (err.code === 11000) {
                        if (err.keyPattern && err.keyPattern.email) {
                            return res.status(400).json({ errors: { email: 'Email already exists' } });
                        }
                    }
                    return res.status(500).json({ error: 'Internal Server Error', "errors": err });
                }

            } catch (error) {
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
            const { searchTerm, page = 1, pageSize = 10 } = req.query;
            const role1 = await Role.findOne({ type:"admin"});

            // Construct the query object for User.find() based on search term
            const query = { role: { $ne: role1?._id } };
            if (searchTerm) {
                query.$or = [
                    { first_name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by username
                    { last_name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by username
                    { email: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by email
                ];
            }

            // Calculate the skip value to paginate results
            const skip = (page - 1) * pageSize;

            // Fetch users based on the constructed query and pagination parameters
            const users = await User.find(query)
                .populate({
                    path: 'organization',
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
            let { token } = req.query;

            if (token) {
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
            const { _id, first_name, last_name, email, organization, createdAt, updatedAt } = user;

            res.status(200).json({
                _id,
                first_name,
                last_name,
                email,
                role: role ? role.type : null,
                role_id: role ? role?._id : null,
                organization,
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
        const { first_name, last_name, email, user_type, organization_id } = req.body;
        //var uniqueFilename = '';
        try {
            // Find the user by ID
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            /*if (req.files && req.files.length > 0) {
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
            }*/

            user.first_name = first_name;
            user.last_name = last_name;
            // user.email = email;
            user.organization = (organization_id) ? organization_id : null;
            user.role = user_type;
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
            const { searchTerm, type } = req.query;

            // Construct the query object for User.find() based on search term
            const role = await Role.findOne({ type: type });

            const query = {
                $and: [
                    {
                        $or: [
                            { organization: req.params.org_id },
                            { created_by: req.params.org_id },
                        ],
                    },
                    searchTerm
                        ? {
                              $or: [
                                  { first_name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by first_name
                                  { last_name: { $regex: searchTerm, $options: 'i' } },  // Case-insensitive search by last_name
                                  { email: { $regex: searchTerm, $options: 'i' } },      // Case-insensitive search by email
                              ],
                          }
                        : {}, // If no searchTerm, add an empty condition
                ],
                role: role?._id,
            };


            // Fetch users based on the constructed query and pagination parameters
            const users = await User.find(query)
                .populate({
                    path: 'organization',
                    select: 'name', // Exclude the __v field from the populated organization documents
                })
                .populate('role', 'type')
                .populate('created_by', 'first_name last_name email') // Populate the role field as well
                // Populate the role field as well
                .sort({ createdAt: -1 }); // Sort by creation date in descending order

            const usersWithSurveyCounts = await Promise.all(users.map(async (user) => {
                const surveyCount = await Survey.countDocuments({
                    loop_lead: user._id,
                });
                return {
                    ...user.toObject(), // Convert the Mongoose document to a plain object
                    surveyCount: surveyCount,
                };
            }));
            const usersCount = await User.countDocuments(query);

            res.status(200).json({
                status: 'success',
                users: usersWithSurveyCounts,
                usersCount:usersCount
            });

        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getLoopLeadsUserByOrgId: async (req, res) => {
        try {
            // Extract search parameters and pagination parameters from request
            const { user_id, org_id } = req.params;

            const query = {
                $or: [
                    { organization: org_id },
                    { created_by: org_id }
                ],
                _id: user_id,
            };


            // Fetch users based on the constructed query and pagination parameters
            const user = await User.findOne(query)
                .populate({
                    path: 'organization',
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
            let emailRes = await sendEmail('PasswordResetMail', { user, token });


            res.status(200).json({ status: true, message: 'Password reset email sent', emailRes: emailRes });
        } catch (error) {
            console.error('Error handling forgot password:', error);
            res.status(500).json({ error: error });
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

            res.status(200).json({ status: true, message: 'Password has been reset successfull' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    createPassword: async (req, res) => {
        const { token, newPassword } = req.body;

        try {
            const user = await User.findById(token);
            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired token' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
            user.resetPasswordToken = undefined; // Clear the token
            user.resetPasswordExpires = undefined; // Clear the expiry time

            await user.save();

            res.status(200).json({ status: true, message: 'Password has been created successfully.' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    removeUser: async (req, res) => {
        const { id } = req.body;
        return res.status(400).json({ error: id });
        try {
            const user = await User.findByIdAndDelete(id);


            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired token' });
            }

            return res.status(200).json({ error: 'user deleted' });

        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    fetchManager: async (req, res) => {
        try {

            // Find the "manager" role by name
            const managerRole = await Role.findOne({ type: 'manager' });
            if (!managerRole) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Manager role not found',
                });
            }
            const users = await User.find({ role: managerRole._id })
            res.status(200).json({
                status: 'success',
                users,
            });
        } catch (error) {
            console.error('Error fetching managers:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    UpdateLoopLead: async (req, res) => {
        const { id } = req.params;
        const { first_name, last_name, email, title, new_created_by, created_by } = req.body;
  
        try {
            // Check if the provided email is unique (not already in use)
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== id) {
                return res.status(400).json({ message: 'Email is already in exist' });
            }

            // Prepare data for updating
            const updateData = {
                first_name,
                last_name,
                email,
                title,
                created_by: new_created_by ? new_created_by : created_by._id,
            };

            const updatedUser = await User.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ status: 200, data: updatedUser, message: 'Update record successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};


module.exports = UserController;
