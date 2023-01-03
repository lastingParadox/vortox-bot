const mongoose = require('mongoose');
const { Schema } = mongoose;

let quoteSchema = new Schema( {
    _id: Schema.Types.ObjectId,
    quote: String,
    speaker: { type: Schema.Types.ObjectId, ref: 'Character' },
    location: { type: Schema.Types.ObjectId, ref: 'Location' },

    guildId: String
});

const Quote = mongoose.model("Quote", quoteSchema)

module.exports = Quote;
