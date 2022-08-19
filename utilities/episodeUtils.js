const fs = require('fs');

class EpisodeUtils {

    static episodeArray;

    static start() {
        EpisodeUtils.episodeArray = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\episodes.json`, 'utf8'));

        fs.watch(process.cwd() + `\\items\\episodes.json`, (eventType) => {
            if (eventType === "change") {
                EpisodeUtils.episodeArray = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\episodes.json`, 'utf8'));
            }
        })
    }

    static isCurrentEpisode() {
        return (EpisodeUtils.episodeArray.episodeThread !== "")
    }

    static getEpisodeThread() {
        return EpisodeUtils.episodeArray.episodeThread;
    }

    static getCampaignName() {
        return EpisodeUtils.episodeArray.campaignName;
    }

    static getEpisodeUsers() {
        return EpisodeUtils.episodeArray.episodeUsers;
    }

}

module.exports = { EpisodeUtils }