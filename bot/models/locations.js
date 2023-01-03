const mongoose = require('mongoose');
const { Schema } = mongoose;

let locationSchema = new Schema( {
    _id: Schema.Types.ObjectId,
    id: { type: String, required: true, unique: true },
    name: String,
    description: String,

    count: Number,

    guildId: String
})

locationSchema.index({
    id: 1,
    guildId: 1,
}, {
    unique: true,
});

const Location = mongoose.model("Location", locationSchema)

module.exports = Location;
