const mongoose = require('mongoose');
const { Schema } = mongoose;

let locationSchema = new Schema( {
    id: { type: String, required: true, unique: true },
    name: String,
    description: String,

    count: Number,

    guildId: String
})

module.exports = { locationSchema }