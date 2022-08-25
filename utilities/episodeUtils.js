const mongoose = require("mongoose");
const {episodeSchema} = require("../models/episodes");

class EpisodeUtils {

    static #Episode = mongoose.model("Episodes", episodeSchema);
    static currentEpisode;

    static async start() {
        this.currentEpisode = await this.#Episode.findOne({current: true});
    }

    static isCurrentEpisode() {
        return (this.currentEpisode !== null);
    }

}

module.exports = { EpisodeUtils }
