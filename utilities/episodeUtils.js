const Episode = require("../models/episodes");

class EpisodeUtils {

    static currentEpisode;

    static async start() {
        this.currentEpisode = await Episode.findOne({current: true});
    }

    static isCurrentEpisode() {
        return this.currentEpisode != null;
    }

    static isCombat() {
        return this.isCurrentEpisode() && this.currentEpisode.combat.players.length > 0
    }

}

module.exports = { EpisodeUtils }
