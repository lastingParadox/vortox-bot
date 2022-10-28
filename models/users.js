const mongoose = require('mongoose');
const { Schema } = mongoose;

let userSchema = new Schema( {
    _id: Schema.Types.ObjectId,
    id: { type: String, required: true },

    user: { type: Schema.Types.ObjectId, ref: 'Character' },

    orbCount: Number,
    squoatCount: Number,

    guildId: String
});

userSchema.index({
    id: 1,
    guildId: 1,
}, {
    unique: true,
});

const User = mongoose.model("User", userSchema)

module.exports = User;
