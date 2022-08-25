const mongoose = require('mongoose');
const { Schema } = mongoose;

let episodeSchema = new Schema( {
    id: { type: String, required: true, unique: true },
    name: String,
    description: String,
    threadId: String,
    current: Boolean,
    players: [{
        id: String,
        name: String,
        messageCount: Number,
        hasLeft: Boolean,
        turn: Boolean
    }],
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

module.exports = { episodeSchema }
