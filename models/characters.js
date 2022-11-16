const mongoose = require('mongoose');
const { Schema } = mongoose;

let characterSchema = new Schema( {
    _id: Schema.Types.ObjectId,
    id: { type: String, required: true },
    name: String,
    description: String,

    game: {
        hp: Number,
        maxHp: Number,
        shield: Number,
        incorporeal: Boolean,
        resistances: {
            sharp: Number,
            blunt: Number,
            explosive: Number,
            plasma: Number,
            laser: Number,
            fire: Number,
            freeze: Number,
            shock: Number,
            biological: Number
        },
        damageOverTime: {
            status: String,
            damageRoll: String,
            turnsLeft: Number
        },
    },

    meta: {
        image: String,
        color: String,
        guildId: String,
        author: String
    },

    locations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],

    quotes: [{
        quote: String,
        location: String
    }],
    quoteAmount: Number,

})

characterSchema.index({
    id: 1,
    'meta.guildId': 1,
}, {
    unique: true,
});

const Character = mongoose.model("Character", characterSchema)

module.exports = Character;
