const mongoose = require('mongoose');
const { Schema } = mongoose;

let typeSchema = new Schema( {
    id: { type: String, required: true, unique: true },
    missRate: { type: Number, required: true, min: 0, max: 100 },
    guildId: String,
    userId: String
})

module.exports = { typeSchema }