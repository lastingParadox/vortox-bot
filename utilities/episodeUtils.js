const Episode = require("../models/episodes");

class EpisodeUtils {

    static currentEpisode;

    static async start() {
        this.currentEpisode = await Episode.findOne({current: true});
    }

    static isCurrentEpisode() {
        return (this.currentEpisode !== null);
    }

}

module.exports = { EpisodeUtils }
