const { EpisodeUtils } = require("../utilities/episodeUtils");
module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (EpisodeUtils.isCurrentEpisode() === false || message.channel.id !== EpisodeUtils.currentEpisode.threadId || message.author.bot)
            return;

        EpisodeUtils.currentEpisode.messageCount -= 1;

        let users = EpisodeUtils.currentEpisode.players;

        for (let user of users) {
            if (message.author.id === user.id) {
                user.messageCount -= 1;
                break;
            }
        }

        EpisodeUtils.currentEpisode.save();
    },
};