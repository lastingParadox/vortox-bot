const mongoose = require('mongoose');
const { Schema } = mongoose;

let listSchema = new Schema( {
    messageId: { type: String, required: true },
    type: String,
    title: String,
    footer: String,
    embeds: [{
        id: String,
        name: String,
        misc: String
    }],
    selectedIndex: Number,

    guildId: String
}, { timestamps: true })

listSchema.index({ createdAt: 1 },{ expireAfterSeconds: 3600 });

module.exports = { listSchema }
