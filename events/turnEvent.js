const { EpisodeUtils } = require("../utilities/episodeUtils");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand() || interaction.ephemeral) return;
        const command = client.commands.get(interaction.commandName);

        if (!command) return

        const currentEpisode = await EpisodeUtils.currentEpisode(interaction.guildId)
            .populate({ path: 'user', populate: { path: 'character'}});

        if (currentEpisode == null || interaction.channel.id !== currentEpisode.threadId)
            return;

        if (currentEpisode.mode === "roleplay") {
            if (command.data.name !== "8ball" && command.data.name !== "choose" && command.data.name !== "roll") {
                return;
            }
        }
        else if (currentEpisode.mode === "combat") {
            if (command.data.name !== "8ball" && command.data.name !== "choose" && command.data.name !== "dmg") {
                return;
            }
        }

        const player = currentEpisode.players.find(x => x.turn === true);

        if (player.user == null) {
            if (interaction.member.roles.cache.find(role => role.id === player.role) === null)
                return;
        }
        else if (player.user.id !== interaction.member.id) return;

        if (currentEpisode.players.indexOf(player) === currentEpisode.players.length - 1)
            currentEpisode.turnCount++;

        player.turn = false;
        if (player.user != null) {
            let nick = ""
            if (currentEpisode.mode === "roleplay")
                nick = interaction.member.displayName.replace('🎱', '');
            else if (currentEpisode.mode === "combat")
                nick = interaction.member.displayName.replace('✊', '');

            if (nick.charAt(nick.length - 1) === ' ') nick = nick.slice(0, nick.length - 1);

            await EpisodeUtils.changeNickname(interaction, interaction.member, nick);
        }

        for (let i = 1; i <= currentEpisode.players.length; i++) {
            let temp = currentEpisode.players[(currentEpisode.players.indexOf(player) + i) % currentEpisode.players.length]
            console.log(temp);
            if (!temp.hasLeft) {
                if (temp.user != null) {
                    let discordUser = await interaction.guild.members.cache.get(temp.user.id);
                    let userNick = discordUser.displayName;

                    if (currentEpisode.mode === "roleplay") userNick = userNick + " 🎱";
                    else if (currentEpisode.mode === "combat") userNick = userNick + " ✊";

                    await EpisodeUtils.changeNickname(interaction, discordUser, userNick);
                }
                temp.turn = true;
                break;
            }
        }

        await currentEpisode.save();
    },
};
