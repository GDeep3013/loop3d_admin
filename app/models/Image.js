const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const imageSchema = new mongoose.Schema({
    project_id: {type: Types.ObjectId},
    src: { type: String },
    fileText: { type: String }
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
