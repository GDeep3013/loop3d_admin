const User = require('../models/User.js');
const Role = require('../models/Role.js');
const bcrypt = require('bcrypt');

const expressFileupload = require('express-fileupload')
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uploadPath = path.join(__dirname, 'profile-pics');
const fs = require('fs');


const UserController = {
    registerUser: async (req, res) => {
        // console.log(req.files);
        try {
            const { name, password, email, phone, designation, skills, userType } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            var uniqueFilename = ''
            if (req.files) {
                const uploadedFile = req.files;
                uniqueFilename = uuidv4() + path.extname(uploadedFile[0].originalname);
                try {
                    fs.writeFile(path.join(__dirname, '../../public/employee-pics', uniqueFilename), uploadedFile[0].buffer, (err) => {
                        if (err) {
                            console.error('Error writing file:', err);
                            return res.status(500).json({ message: 'Error uploading image' });
                        }
                    });
                } catch (err) {
                    console.log(err);
                }
            }
            console.log('uniqueFilename2', uniqueFilename);
            const user = new User({
                username: name,
                email: email,
                phone: phone,
                password: hashedPassword,
                designation: designation,
                skills: skills,
                role: userType,
                image: req.files ? uniqueFilename : null
            });
            await user.save();
            console.log(user);
            // const projectData = await project.save();
            //    res.json({ user });

            res.status(201).json({
                message: 'User registered successfully'
            });

        } catch (error) {

            if (error.code === 11000) {
                if (error.keyPattern.email) {
                    res.status(400).json({
                        errors: {
                            email: 'Email is already exist'
                        }
                    });
                } else if (error.keyPattern.phone) {

                    res.status(400).json({
                        errors: {
                            phone: 'Phone number is already exist'
                        }
                    });
                } else {
                    res.status(500).json({
                        error: 'Internal Server Error'
                    })
                }
            }
        }
    },

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

            const token = await bcrypt.hash(user.id, 10);

            return res.status(200).json({
                status: 'success',
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.username,
                    role: role ? role.type : null,
                    image: user.image ? user.image : null
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
                    { username: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by username
                    { email: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by email
                    { designation: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by designation
                    { skills: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by skills
                ];
            }

            // Calculate the skip value to paginate results
            const skip = (page - 1) * pageSize;

            // Fetch users based on the constructed query and pagination parameters
            const users = await User.find(query)
                .populate('role', '-__v')
                .sort({ createdAt: -1 })
                .skip(skip) // Skip documents for previous pages
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
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Exclude sensitive fields like password from the response
            const { _id, username, email, phone, designation, skills, role, image, createdAt, updatedAt } = user;
            res.status(200).json({
                _id,
                username,
                email,
                phone,
                designation,
                skills,
                role,
                image,
                createdAt,
                updatedAt
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updateUser: async (req, res) => {
        const userId = req.params.id;
        const { name, email, phone, designation, skills, userType } = req.body;
        var uniqueFilename = '';
        try {
            // Find the user by ID
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (req.files && req.files.length > 0) {
                if (user.image) {
                    console.log('image', path.join(__dirname, '../../public/employee-pics', user.image));
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
            user.image = uniqueFilename;
            user.username = name;
            user.email = email;
            user.phone = phone;
            user.designation = designation;
            user.skills = skills;
            user.role = userType;
            await user.save();

            res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
            // Handle errors
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

};

module.exports = UserController;
