const { EpisodeUtils } = require("../utilities/episodeUtils");
module.exports = {
    name: 'messageDelete',
    async execute(message) {
        let currentEpisode = await EpisodeUtils.currentEpisode(message.guildId);

        if (currentEpisode == null || message.channel.id !== currentEpisode.threadId || message.author.bot)
            return;

        currentEpisode.messageCount -= 1;

        let users = currentEpisode.players;

        for (let user of users) {
            if (message.author.id === user.id) {
                user.messageCount -= 1;
                break;
            }
        }

        currentEpisode.save();
    },
};
