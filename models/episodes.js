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
        id: String,
        name: String,
        messageCount: Number,
        hasLeft: Boolean,
        turn: Boolean
    }],
    turnCount: Number,
    messageCount: Number,
    episodeLength: String,

    combat: [{
        id: String,
        name: String,
        turn: Boolean,
        character: { type: Schema.Types.ObjectId, ref: 'Character' }
    }],

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
