const Project = require('../models/Project.js');
const User = require('../models/User.js');
const mongoose = require('mongoose');
const Image = require('../models/Image.js');
const expressFileupload = require('express-fileupload')
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uploadPath = path.join(__dirname, 'uploads');
const fs = require('fs');
const { ObjectId } = mongoose.Types;


const ProjectController = {
    projectStore: async (req, res) => {
        try {
            const {
                projectName, projectDescription, keyFeatures, skills, timelineMilestone, budgetType, budget, clientName, clientLocation, teamMembers,
                figmaLink, liveLink, githubLink, submissionDeadline, fileText, upWorkId
            } = req.body;
            const project = new Project({
                projectName, projectDescription, keyFeatures, skills, timelineMilestone, budgetType, budget, clientName, clientLocation, teamMembers,
                figmaLink, liveLink, githubLink, submissionDeadline, fileText, upWorkId
            });

            const projectData = await project.save();
            const fileTextarray = JSON.parse(fileText)
            if (projectData) {
                if (req.files && req.files.length > 0) {
                    for (let i = 0; i < req.files.length; i++) {
                        const uploadedFile = req.files[i];
                        const uniqueFilename = uuidv4() + path.extname(uploadedFile.originalname);
                        // Move the uploaded file to the desired destination
                        fs.writeFile(path.join(__dirname, '../../public/uploads', uniqueFilename), uploadedFile.buffer, (err) => {
                            if (err) {
                                console.error('Error writing file:', err);
                                return res.status(500).json({ message: 'Error uploading image' });
                            }
                        });

                        // Create a new image document and save it to the database
                        const uploadImage = new Image({
                            project_id: projectData._id,
                            src: uniqueFilename,
                            fileText: fileTextarray[i] // Add the fileText corresponding to the current index
                        });

                        try {
                            await uploadImage.save();
                        } catch (error) {
                            console.error('Error saving image:', error);
                            return res.status(500).json({ message: 'Error saving image' });
                        }
                    }
                } else {
                    return res.status(200).json({ message: 'Project is saved without an image' });
                }
            }
            res.status(200).json({ message: 'Project and images saved successfully' });
        } catch (error) {
            console.error('Error storing project:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // fetchProject: async (req, res) => {
    //     try {
    //         const projects = await Project.find().sort({ createdAt: -1 });
    //         const projectIds = projects.map(project => project._id);

    //         const images = await Image.find({ project_id: { $in: projectIds } });


    //         const teamMemberIds = projects.reduce((acc, project) => {

    //             const parsedIds = JSON.parse(project.teamMembers[0]);
    //             const validIds = parsedIds.map(id => ObjectId.isValid(id) ? new ObjectId(id) : null);
    //             acc.push(...validIds);
    //             return acc;
    //         }, []);
    //         const validTeamMemberIds = teamMemberIds.filter(id => id !== null);
    //         const teamMembers = await User.find({ _id: { $in: validTeamMemberIds } });
    //         const data = projects.map(project => {
    //             const projectImages = images.filter(image => image.project_id.toString() === project._id.toString());
    //             const projectTeamMembers = teamMembers.filter(member => project.teamMembers.includes(member._id.toString()));

    //             return {
    //                 ...project.toObject(),
    //                 images: projectImages,
    //                 teamMembers: projectTeamMembers,
    //             };
    //         });
    //         res.json({
    //             status: 'success',
    //             count: projects.length,
    //             projects: data
    //         });
    //     } catch (error) {
    //         console.error('Error fetching projects:', error);
    //         res.status(500).json({ message: 'Internal server error' });
    //     }
    // },
    fetchProject: async (req, res) => {
        try {

            const { searchTerm, technology, price } = req.query;
            const page = req.query.page || 1;
            const limit = 5;
            const skip = (page - 1) * limit;
            const query = {};

            if (searchTerm) {
                query.$or = [
                    { projectName: { $regex: searchTerm, $options: 'i' } },
                    { projectDescription: { $regex: searchTerm, $options: 'i' } },
                    { skills: { $regex: searchTerm, $options: 'i' } },
                    { upWorkId: { $regex: searchTerm, $options: 'i' } },
                    { clientName: { $regex: searchTerm, $options: 'i' } },
                    { budget: { $regex: searchTerm, $options: 'i' } },
                ];
            }

            if (technology) {
                const technologies = technology.split(',').map(tech => tech.trim());
                const technologyQueries = technologies.map(tech => ({ skills: { $regex: tech, $options: 'i' } }));
                if (!query.$and) {
                    query.$and = [];
                }
                query.$and.push({ $and: technologyQueries });

            }
           
                if (price) {
                    const priceQuery = getPriceQuery(price);
                    if (priceQuery) {
                        query.budget = priceQuery
                    }
                }
 
            // Function to map selected price range to MongoDB query
            function getPriceQuery(selectedPrice) {
                const [min, max] = selectedPrice.split('-').map(str => parseInt(str.replace(/\D/g, ''), 10));
                switch (selectedPrice) {
                    case '<100':
                        return { $lt: 100 };
                    case '100-500':
                        return { $gte: min, $lte: max };
                    case '500-1000':
                        return { $gte: min, $lte: max };
                    case '1000-5000':
                        return { $gte: min, $lte: max };
                    case '5000+':
                        return { $gte: 5000 };
                    default:
                        return null;
                }
            }

            const projects = await Project.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
            const projectIds = projects.map(project => project._id);
            const images = await Image.find({ project_id: { $in: projectIds } });

            const teamMemberIds = projects.reduce((acc, project) => {
                const parsedIds = JSON.parse(project.teamMembers[0]);
                const validIds = parsedIds.map(id => ObjectId.isValid(id) ? new ObjectId(id) : null);
                acc.push(...validIds);
                return acc;
            }, []);
            const validTeamMemberIds = teamMemberIds.filter(id => id !== null);
            const teamMembers = await User.find({ _id: { $in: validTeamMemberIds } });

            const data = projects.map(project => {
                const projectImages = images.filter(image => image.project_id.toString() === project._id.toString());
                const projectTeamMembers = teamMembers.filter(member => project.teamMembers.includes(member._id.toString()));

                return {
                    ...project.toObject(),
                    images: projectImages,
                    teamMembers: projectTeamMembers,
                };
            });
            const totalCount = await Project.countDocuments(query);

            res.json({
                status: 'success',
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                projects: data
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
            res.status(500).json({ message: 'Internal server error' });
        }

    },
    deleteProject: async (req, res) => {
        try {
            const deletedProject = await Project.findByIdAndDelete(req.params.id);
            if (!deletedProject) {
                return res.status(404).json({ error: 'Project not found' });
            }
            await Image.deleteMany({ project_id: deletedProject._id })
            res.status(200).json({ status: 'success', message: 'Project  deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    showProject: async (req, res) => {
        try {
            const projectId = req.params.id;
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            const images = await Image.find({ project_id: projectId });

            const teamMemberIds = JSON.parse(project.teamMembers[0]);
            res.status(200).json({ status: "success", project, images, teamMemberIds });
        } catch (error) {
            console.error('Error displaying project:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    updateProject: async (req, res) => {
        try {
            const projectId = req.params.id; // Assuming the project ID is passed in the URL parameters
            const {
                projectName, projectDescription, keyFeatures, skills, timelineMilestone, budgetType, budget, clientName, clientLocation, teamMembers,
                submissionDeadline, figmaLink, liveLink, githubLink, fileText, upWorkId, removedFiles
            } = req.body;
            const fileTextarray = JSON.parse(fileText)
            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            if (removedFiles) {
    
                for (const fileName of removedFiles.split(',')) {
                    try {
                        // Delete file from MongoDB
                        const deletedImage = await Image.findOneAndDelete({ project_id: project._id, src: fileName });
                        if (deletedImage) {
                            console.log(`File ${fileName} deleted from the database successfully.`);
                        } else {
                            console.log(`File ${fileName} not found in the database.`);
                        }

                        // Delete file from public upload folder
                        const filePath = path.join(__dirname, '../../public/uploads', fileName);
                        fs.unlinkSync(filePath);
                        console.log(`File ${fileName} deleted from the folder successfully.`);
                    } catch (err) {
                        console.error(`Error deleting file ${fileName}: ${err.message}`);
                    }
                }
            }
            const existingFiles = await Image.find({ project_id: projectId }).select('fileName');
            const existingFileNames = existingFiles.map(file => file.fileName);

            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const uploadedFile = req.files[i];
                    const uniqueFilename = uuidv4() + path.extname(uploadedFile.originalname);
                    // Move the uploaded file to the desired destination
                    fs.writeFile(path.join(__dirname, '../../public/uploads', uniqueFilename), uploadedFile.buffer, (err) => {
                        if (err) {
                            console.error('Error writing file:', err);
                            return res.status(500).json({ message: 'Error uploading image' });
                        }
                    });

                    const uploadImage = new Image({
                        project_id: project._id,
                        src: uniqueFilename,
                        fileText: fileTextarray[i]
                    });

                    try {
                        await uploadImage.save();
                    } catch (error) {
                        console.error('Error saving image:', error);
                        return res.status(500).json({ message: 'Error saving image' });
                    }
                }
            }

            project.projectName = projectName;
            project.projectDescription = projectDescription;
            project.keyFeatures = keyFeatures;
            project.skills = skills;
            project.timelineMilestone = timelineMilestone;
            project.budgetType = budgetType;
            project.budget = budget;
            project.clientName = clientName;
            project.clientLocation = clientLocation;
            project.teamMembers = teamMembers;
            project.submissionDeadline = submissionDeadline;
            project.figmaLink = figmaLink;
            project.liveLink = liveLink;
            project.githubLink = githubLink;
            project.fileText = fileText;
            project.upWorkId = upWorkId;
            await project.save();

            res.status(200).json({ message: 'Project updated successfully', project })

        } catch (error) {
            console.error('Error updating project:', error);
            res.status(500).json({ message: 'Internal server error' });
        }

    },



};

module.exports = ProjectController;
