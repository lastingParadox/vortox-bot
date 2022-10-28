const mongoose = require('mongoose');
const { Schema } = mongoose;

let episodeSchema = new Schema( {
    _id: Schema.Types.ObjectId,
    id: { type: String, required: true },
    name: String,
    description: String,
    threadId: String,
    current: Boolean,
    players: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        messageCount: Number,
        hasLeft: Boolean,
        turn: Boolean,

        damageOverTime: {
            status: String,
            damageRoll: String,
            turnsLeft: Number
        },
    }],

    mode: String,
    turnCount: Number,
    messageCount: Number,
    episodeLength: String,

    guildId: String
})

episodeSchema.index({
    id: 1,
    guildId: 1,
}, {
    unique: true,
});

const Episode = mongoose.model("Episode", episodeSchema)

module.exports = Episode;
