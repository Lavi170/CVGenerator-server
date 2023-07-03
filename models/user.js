const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cvs:[{   type: mongoose.Types.ObjectId, ref: "Cv"}]
});

module.exports = mongoose.model('User', userSchema);