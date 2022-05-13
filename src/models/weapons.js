const mongoose = require('mongoose');
const { Schema } = mongoose;

let weaponSchema = new Schema( {
    id: { type: String, required: true, unique: true },
    name: String,
    type: String,
    damage: String,
    description: String
})

module.exports = { weaponSchema }