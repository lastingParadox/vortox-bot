const mongoose = require('mongoose');
const { Schema } = mongoose;

let characterSchema = new Schema( {
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
        }
    },

    meta: {
        image: String,
        color: String,
        guildId: String,
        author: String
    },

    locations: [String],

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

module.exports = { characterSchema }
