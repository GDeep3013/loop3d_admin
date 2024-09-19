const Goals = require('../models/Goals');
const GoalController = {
    createGoals : async (req, res) => {
        try {

            const { specific_goal, dead_line, competency, goal_apply, goal_result, status, marked_as } = req.body;

            const newGoals = new Goals({
                specific_goal,
                dead_line,
                competency,
                goal_apply,
                goal_result,
                status,
                marked_as
            });

            const savedGoals = await newGoals.save();
            res.status(201).json(savedGoals);

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getAllGoals: async (req, res) => {
        try {
            // Get 'page' and 'limit' from query parameters with default values
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const limit = parseInt(req.query.limit) || 10; // Default to 10 results per page

            // Calculate the number of documents to skip
            const skip = (page - 1) * limit;
            let searchTerm = req.query.searchTerm
            const query = {};
            if (searchTerm) {
                query.$or = [
                    { name: { $regex: searchTerm, $options: 'i' } }
                ];
            }
            // Query the database with pagination
            const goals = await Goals.find(query).sort({ _id: -1 }).skip(skip).limit(limit);

            // Get the total count of documents in the collection
            const totalGoals = await Goals.countDocuments();

            // Calculate total pages
            const totalPages = Math.ceil(totalGoals / limit);

            // Send the response with the organizations and pagination info
            res.status(200).json({
                status:"success",
                data: goals,
                currentPage: page,
                totalPages,
                totalGoals
            });
            
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
}
module.exports = GoalController;