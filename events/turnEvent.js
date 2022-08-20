const { EpisodeUtils } = require("../utilities/episodeUtils");
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command || !EpisodeUtils.isCurrentEpisode() || interaction.channel.id !== EpisodeUtils.episodeArray.currentEpisode.episodeThread)
            return;

        if (command.data.name !== "8ball" && command.data.name !== "dmg" && command.data.name !== "choose" && command.data.name !== "roll") {
            return;
        }

        const currentEpisode = EpisodeUtils.episodeArray.currentEpisode;
        const user = currentEpisode.episodeUsers.find(x => x.id === interaction.member.id);
        if (!user || user.turn === false) return;

        user.turn = false;
        currentEpisode.episodeUsers[(currentEpisode.episodeUsers.indexOf(user) + 1) % currentEpisode.episodeUsers.length].turn = true;

        EpisodeUtils.save();
    },
};