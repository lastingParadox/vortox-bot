const mongoose = require('mongoose');
const { Schema } = mongoose;

let characterSchema = new Schema( {
    id: { type: String, required: true, unique: true },
    name: String,
    description: String,
    hp: Number,
    maxHp: Number,
    image: String,
    color: String,
    quotes: [{
        quote: String,
        location: String
    }]

})

module.exports = { characterSchema }