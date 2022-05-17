const mongoose = require('mongoose');
const { Schema } = mongoose;

let locationSchema = new Schema( {
    id: { type: String, required: true, unique: true },
    count: Number
})

module.exports = { locationSchema }