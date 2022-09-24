const { EpisodeUtils } = require("../utilities/episodeUtils");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand() || interaction.ephemeral) return;
        const command = client.commands.get(interaction.commandName);
        if (!command || !EpisodeUtils.isCurrentEpisode() || interaction.channel.id !== EpisodeUtils.currentEpisode.threadId)
            return;

        if (command.data.name !== "8ball" && command.data.name !== "choose" && command.data.name !== "roll") {
            return;
        }

        const currentEpisode = EpisodeUtils.currentEpisode;

        const user = currentEpisode.players.find(x => x.turn === true);

        if (user.id === "DM") {
            if (interaction.member.roles.cache.find(role => role.id === user.role) === null)
                return;
        }
        else if (user.id !== interaction.member.id) return;

        if (currentEpisode.players.indexOf(user) === currentEpisode.players.length - 1)
            currentEpisode.turnCount++;

        user.turn = false;

        for (let i = 1; i <= currentEpisode.players.length; i++) {
            let temp = currentEpisode.players[(currentEpisode.players.indexOf(user) + i) % currentEpisode.players.length]
            if (temp.hasLeft !== true) {
                temp.turn = true;
                break;
            }
        }

        await EpisodeUtils.currentEpisode.save();
    },
};
