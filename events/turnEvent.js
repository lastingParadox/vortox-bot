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
        if (user.id !== "DM") {
            let nick = interaction.member.displayName.replace('🎱', '');
            if (nick.charAt(nick.length - 1) === ' ') nick = nick.slice(0, nick.length - 1);

            await EpisodeUtils.changeNickname(interaction, interaction.member, nick);
        }

        for (let i = 1; i <= currentEpisode.players.length; i++) {
            let temp = currentEpisode.players[(currentEpisode.players.indexOf(user) + i) % currentEpisode.players.length]
            console.log(temp);
            if (temp.hasLeft !== true && temp.id !== 'DM') {
                let discordUser = await interaction.guild.members.cache.get(temp.id);
                let userNick = discordUser.displayName;

                if (userNick.charAt(userNick.length - 1) === '⚔') userNick = userNick.slice(0, userNick.length - 1) + '🎱⚔';
                else userNick = userNick + " 🎱";

                await EpisodeUtils.changeNickname(interaction, discordUser, userNick);
                temp.turn = true;
                break;
            }
        }

        await EpisodeUtils.currentEpisode.save();
    },
};
