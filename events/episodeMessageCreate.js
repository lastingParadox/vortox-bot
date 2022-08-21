const { EpisodeUtils } = require("../utilities/episodeUtils");
module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (EpisodeUtils.isCurrentEpisode() === false || message.channel.id !== EpisodeUtils.episodeArray.currentEpisode.episodeThread || message.author.bot)
            return;

        EpisodeUtils.episodeArray.currentEpisode.messageCount += 1;

        let users = EpisodeUtils.episodeArray.currentEpisode.episodeUsers;

        for (let user of users) {
            if (message.author.id === user.id) {
                user.messageCount += 1;
                break;
            }
        }

        EpisodeUtils.save();
    },
};