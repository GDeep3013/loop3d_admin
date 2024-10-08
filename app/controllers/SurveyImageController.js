const SurveyImage = require('../models/SurveyChartImage');
const fs = require('fs');
const path = require('path');
const saveBase64Image = (base64Image, filename) => {
    const filePath = path.join(__dirname, '../../public/uploads', filename);
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(filePath, imageBuffer);
    return filePath;
};

const deleteImageFromFileSystem = (filename) => {
    const filePath = path.join(__dirname, '../../public/uploads', filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const saveMultipleImages = async (imagesArray, survey_id) => {
    let filenames = {
        chartRef1: [],
        chartRef2: []
    };
    for (let i = 0; i < imagesArray.chartRef1.length; i++) {
        const base64Image = imagesArray?.chartRef1[i];
        const filename = `${survey_id}-competency-${i + 1}-${Date.now()}.png`;
        await saveBase64Image(base64Image, filename);
        filenames['chartRef1'].push(filename);
    }
    for (let i = 0; i < imagesArray.chartRef2.length; i++) {
        const base64Image = imagesArray?.chartRef2[i];
        const filename = `${survey_id}-competency-${i + 1}-${Date.now()}.png`;
        await saveBase64Image(base64Image, filename);
        filenames['chartRef2'].push(filename);
    }
    return filenames;
};

exports.saveChartImage = async (req, res) => {
    const { survey_id, chart_image, summaries_by_competency } = req.body;

    try {
        // Handle summaries first if they exist
        let newImageFilenames = [];
        // Create a unique filename for the new chart image
        const chartImageFilename = `${survey_id}-chart-${Date.now()}.png`;

        // Check if a record already exists for this survey_id
        let existingSurveyImage = await SurveyImage.findOne({ survey_id });



        if (existingSurveyImage) {

            if (Array.isArray(summaries_by_competency?.chartRef1) && summaries_by_competency.chartRef1.length > 0) {
                existingSurveyImage.summaries_by_competency?.chartRef1?.forEach((filename) => {
                    deleteImageFromFileSystem(filename);
                });
                existingSurveyImage.summaries_by_competency?.chartRef2?.forEach((filename) => {
                    deleteImageFromFileSystem(filename);
                });
                newImageFilenames = await saveMultipleImages(summaries_by_competency, survey_id);
            }
            // Save new images
            if (chart_image) {
                if (existingSurveyImage.chart_image) {
                    
                    deleteImageFromFileSystem(existingSurveyImage.chart_image);
                }
                saveBase64Image(chart_image, chartImageFilename);
                existingSurveyImage.chart_image = chartImageFilename;
                existingSurveyImage.survey_id = survey_id;
            } else {
                // return res.status(201).json({ message: '', data: newImageFilenames });

                existingSurveyImage.summaries_by_competency = newImageFilenames;
                existingSurveyImage.survey_id = survey_id;

                
            }

            // Save the updated document
            const updatedImage = await existingSurveyImage.save();
            return res.status(200).json({ message: 'Survey image updated successfully.', data: updatedImage });
        } else {
            let newSurveyImage = new SurveyImage();
            if (chart_image) {
                saveBase64Image(chart_image, chartImageFilename);
                newSurveyImage.chart_image = chartImageFilename;
                newSurveyImage.survey_id = survey_id;
            } else {
                let newImageFilenames = [];
                if (Array.isArray(summaries_by_competency?.chartRef1) && summaries_by_competency.chartRef1.length > 0) {
                    newImageFilenames = await saveMultipleImages(summaries_by_competency, survey_id);
                    newSurveyImage.summaries_by_competency = newImageFilenames;
                    newSurveyImage.survey_id = survey_id;
                }
                
            }

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
        const images = await SurveyImage.findOne({ survey_id });

        if (!images || images.length === 0) {
            return res.status(404).json({ message: 'No images found for this survey.' });
        }

        return res.status(200).json({ data: images });
    } catch (error) {
        console.error('Error fetching survey images:', error);
        return res.status(500).json({ message: 'Server error. Could not fetch survey images.' });
    }
};
