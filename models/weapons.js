const mongoose = require('mongoose');
const { Schema } = mongoose;

let weaponSchema = new Schema( {
    _id: Schema.Types.ObjectId,
    id: { type: String, required: true, },
    name: String,
    description: String,

    damageTypes: [String],
    ailments: [
        {
            id: String,
            accuracy: Number,
            damage_percentile: Number,
        }
    ],
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

const Weapon = mongoose.model("Weapon", weaponSchema)

module.exports = Weapon;
