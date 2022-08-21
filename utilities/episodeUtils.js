const fs = require('fs');

class EpisodeUtils {

    static episodeArray;

    static start() {
        EpisodeUtils.episodeArray = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\episodes.json`, 'utf8'));

        fs.watch(process.cwd() + `\\items\\episodes.json`, (eventType) => {
            if (eventType === "change") {
                try {
                    EpisodeUtils.episodeArray = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\episodes.json`, 'utf8'));
                } catch (e) {
                    console.log("Unable to parse episodes.json.", e);
                }
            }
        })
    }

    static save() {
        fs.writeFileSync(process.cwd() + `\\items\\episodes.json`, JSON.stringify(EpisodeUtils.episodeArray, null, 2), async err => {
            if (err) {
                console.log(`Error writing to episodes.json.`, err);
            }
        })
    }

    static saveNew(episodes) {
        fs.writeFileSync(process.cwd() + `\\items\\episodes.json`, JSON.stringify(episodes, null, 2), async err => {
            if (err) {
                console.log(`Error writing new instance to episodes.json.`, err);
            }
        })
    }

    static isCurrentEpisode() {
        return (EpisodeUtils.episodeArray.currentEpisode.episodeThread !== "");
    }

}

module.exports = { EpisodeUtils }