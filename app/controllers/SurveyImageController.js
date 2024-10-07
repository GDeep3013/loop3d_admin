const SurveyImage = require('../models/SurveyChartImage');
const fs = require('fs');
const path = require('path');
const saveBase64Image = (base64Image, filename) => {
    // Define the path where the image will be stored
    const filePath = path.join(__dirname, '../../public/uploads', filename);
    
    // Remove the base64 prefix and create a buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Write the image buffer to the specified path
    fs.writeFileSync(filePath, imageBuffer);

    return filePath; // Return the file path where the image is stored
};

// Function to delete an existing image from the server
const deleteImageFromFileSystem = (filename) => {
    const filePath = path.join(__dirname, '../../public/uploads', filename);
    
    // Check if the file exists, then delete it
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file
    }
};

exports.saveChartImage = async (req, res) => {
    const { survey_id, chart_image, summaries_by_competency } = req.body;

    try {
        // Create a unique filename for the new image
        const filename = `${survey_id}-chart-${Date.now()}.png`;

        // Check if a record already exists for this survey_id
        let existingSurveyImage = await SurveyImage.findOne({ survey_id });

        if (existingSurveyImage) {
            // If an image already exists, delete the old image file from the file system
            deleteImageFromFileSystem(existingSurveyImage.chart_image);

            // Update the record in MongoDB with the new image path
            existingSurveyImage.chart_image = filename;
            existingSurveyImage.summaries_by_competency = summaries_by_competency;

            // Save the new image to the file system
            saveBase64Image(chart_image, filename);

            // Save the updated document in the database
            const updatedImage = await existingSurveyImage.save();

            return res.status(200).json({ message: 'Survey image updated successfully.', data: updatedImage });
        } else {
            // If no record exists, create a new one
            const imagePath = saveBase64Image(chart_image, filename);

            const newSurveyImage = new SurveyImage({
                survey_id,
                chart_image: filename, // Save the filename in the database
                summaries_by_competency
            });

            const savedImage = await newSurveyImage.save();
            return res.status(201).json({ message: 'Survey image saved successfully.', data: savedImage });
        }
    } catch (error) {
        console.error('Error saving or updating survey image:', error);
        return res.status(500).json({ message: 'Server error. Could not save or update survey image.' });
    }
};

exports.getSurveyImages = async (req, res) => {
    const { survey_id } = req.params;

    try {
        const images = await SurveyImage.find({ survey_id });

        if (!images || images.length === 0) {
            return res.status(404).json({ message: 'No images found for this survey.' });
        }

        return res.status(200).json({ data: images });
    } catch (error) {
        console.error('Error fetching survey images:', error);
        return res.status(500).json({ message: 'Server error. Could not fetch survey images.' });
    }
};
