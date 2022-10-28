const { SlashCommandBuilder } = require('@discordjs/builders');
const { VortoxColor } = require('../../utilities/enums');
const {EpisodeUtils} = require("../../utilities/episodeUtils");
const {VortoxEmbed} = require("../../utilities/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('turn')
        .setDescription('Returns whose turn it is for the current episode.')
        .addSubcommand(subcommand =>
            subcommand.setName('show')
                .setDescription('Returns whose turn it is for the current episode.'))
        .addSubcommand(subcommand =>
            subcommand.setName('skip')
                .setDescription('Skips the current player for the current turn.'))
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('Lists the players in the current episode.')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let embed;
        let currentEpisode = await EpisodeUtils.currentEpisode(interaction.guildId);

        if (currentEpisode == null) {
            const failEmbed = new VortoxEmbed(VortoxColor.ERROR, "Unable to Access Episode!", `tried to access the current episode.`, interaction.member);
            failEmbed.setDescription(`There is no episode currently in progress!`);
            await interaction.reply({ embeds: [failEmbed], ephemeral: true });
            return;
        }

        if (subcommand === 'show') {

            const userList = currentEpisode.players;
            const user = userList.find(x => x.turn === true);

            embed = new VortoxEmbed(VortoxColor.DEFAULT, "Episode Turn", `asked who has the turn currently.`, interaction.member);

            if (user.id === "DM") embed.setDescription(`It's the DM's turn!`);
            else embed.setDescription(`It's <@${user.id}>'s turn!`);
        }

        else if (subcommand === 'skip') {
            const userList = currentEpisode.players;
            const user = userList.find(x => x.turn === true);
            let newUser;

            let index = userList.indexOf(user);
            if (index === userList.length - 1)
                currentEpisode.turnCount++;

            for (let i = 1; i <= userList.length; i++) {
                let newPlayer = userList[(index + i) % userList.length];
                if (!newPlayer.hasLeft) {
                    newUser = newPlayer;
                    newPlayer.turn = true;
                    break;
                }
            }

            user.turn = false;

            await currentEpisode.save();

            embed = new VortoxEmbed(VortoxColor.DEFAULT, "Skipping Turn", `skipped ${newUser.name}'s turn.`, interaction.member);
            if (newUser.id === "DM")
                embed.setDescription(`Skipped <@${user.id}>'s turn.\nIt is now the DM's turn.`)
            else embed.setDescription(`Skipped <@${user.id}>'s turn.\nIt is now <@${newUser.id}>'s turn.`)
        }
        else if (subcommand === 'list') {

            let userString = "";
            for (let player of currentEpisode.players) {
                if (player.id !== "DM") {
                    if (player.turn === false)
                        userString += `🟦 <@${player.id}>\n`;
                    else
                        userString += `✅ <@${player.id}>\n`;
                } else {
                    if (player.turn === false)
                        userString += `🟦 DM\n`;
                    else
                        userString += `✅ DM\n`;
                }
            }

            embed = new VortoxEmbed(VortoxColor.DEFAULT, "Turn List", `got the turn list.`, interaction.member);
            embed.setDescription(userString);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
