const mongoose = require('mongoose');
const { Schema } = mongoose;

let weaponSchema = new Schema( {
    id: { type: String, required: true, unique: true },
    name: String,
    description: String,

    damageType: String,
    damage: String,
    missRate: Number,

    guildId: String,
    author: String
})

module.exports = { weaponSchema }