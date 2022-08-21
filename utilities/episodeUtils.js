const fs = require('fs');
const path = require("path");

class EpisodeUtils {

    static episodeArray;
    static #episodesPath = path.join(__dirname, '..', 'items', 'episodes.json');

    static start() {
        EpisodeUtils.episodeArray = JSON.parse(fs.readFileSync(EpisodeUtils.#episodesPath, 'utf8'));

        fs.watch(EpisodeUtils.#episodesPath, (eventType) => {
            if (eventType === "change") {
                try {
                    EpisodeUtils.episodeArray = JSON.parse(fs.readFileSync(EpisodeUtils.#episodesPath, 'utf8'));
                } catch (e) {
                    console.log("Unable to parse episodes.json.", e);
                }
            }
        })
    }

    static save() {
        fs.writeFileSync(EpisodeUtils.#episodesPath, JSON.stringify(EpisodeUtils.episodeArray, null, 2), async err => {
            if (err) {
                console.log(`Error writing to episodes.json.`, err);
            }
        })
    }

    static saveNew(episodes) {
        fs.writeFileSync(EpisodeUtils.#episodesPath, JSON.stringify(episodes, null, 2), async err => {
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