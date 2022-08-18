const fs = require('fs');

class EpisodeUtils {

    static episodeArray;

    static start() {
        EpisodeUtils.episodeArray = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\episodes.json`, 'utf8'));

        fs.watch(process.cwd() + `\\items\\episodes.json`, (eventType) => {
            if (eventType === "change") {
                console.log("episodes.json changed!")
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

}

module.exports = { EpisodeUtils }