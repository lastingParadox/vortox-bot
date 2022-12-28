const mongoose = require('mongoose');
const { Schema } = mongoose;

let listSchema = new Schema( {
    _id: Schema.Types.ObjectId,
    messageId: { type: String, required: true },
    type: String,
    title: String,
    footer: String,
    list_embeds: [{
        id: String,
        name: String,
        misc: String
    }],
    character: {
        id: String,
        name: String,
        description: String,

        game: {
            hp: Number,
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
        },
        meta: {
            image: String,
            color: String,
            author: String
        },
    },
    weapon: {
        id: String,
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

        author: String
    },
    selectedIndex: Number,

    guildId: String
}, { timestamps: true })

listSchema.index({ createdAt: 1 },{ expireAfterSeconds: 3600 });

const List = mongoose.model("List", listSchema)

module.exports = List;
