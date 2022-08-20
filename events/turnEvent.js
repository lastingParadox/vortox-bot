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

        const user = currentEpisode.episodeUsers.find(x => x.turn === true);

        if (user.id === "DM") {
            if (interaction.member.roles.cache.find(role => role.id === user.role) === null)
                return;
            currentEpisode.turnCount++;
        }
        else if (user.id !== interaction.member.id) return;

        user.turn = false;

        for (let i = 1; i < currentEpisode.episodeUsers.length; i++) {
            let temp = currentEpisode.episodeUsers[(currentEpisode.episodeUsers.indexOf(user) + i) % currentEpisode.episodeUsers.length]
            if (temp.hasLeft !== true) {
                temp.turn = true;
                break;
            }
        }

        EpisodeUtils.save();
    },
};