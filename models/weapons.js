const mongoose = require('mongoose');
const { Schema } = mongoose;

let weaponSchema = new Schema( {
    id: { type: String, required: true, },
    name: String,
    description: String,

    damageType: String,
    damage: String,
    missRate: Number,
    timesUsed: Number,

    guildId: String,
    author: String
})

weaponSchema.index({
    id: 1,
    guildId: 1,
}, {
    unique: true,
});

module.exports = { weaponSchema }
