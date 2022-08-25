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
                .setDescription('Skips the current player for the current turn.')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let embed;

        if (!EpisodeUtils.isCurrentEpisode()) {
            const failEmbed = new VortoxEmbed(VortoxColor.ERROR, "Unable to Access Episode!", `tried to access the current episode.`, interaction.member);
            failEmbed.setDescription(`There is no episode currently in progress!`);
            await interaction.reply({ embeds: [failEmbed], ephemeral: true });
            return;
        }

        if (subcommand === 'show') {

            const userList = EpisodeUtils.currentEpisode.players;
            const user = userList.find(x => x.turn === true);

            embed = new VortoxEmbed(VortoxColor.DEFAULT, "Episode Turn", `${interaction.member.displayName} asked who has the turn currently.`, interaction.member);

            if (user.id === "DM") embed.setDescription(`It's the DM's turn!`);
            else embed.setDescription(`It's <@${user.id}>'s turn!`);
        }

        else {
            const userList = EpisodeUtils.currentEpisode.players;
            const user = userList.find(x => x.turn === true);
            let newUser;

            let index = userList.indexOf(user);
            for (let i = 1; i < userList.length; i++) {
                let newPlayer = userList[(index + i) % userList.length];
                if (!newPlayer.hasLeft) {
                    newUser = newPlayer;
                    newPlayer.turn = true;
                    break;
                }
            }

            user.turn = false;

            await EpisodeUtils.currentEpisode.save();

            embed = new VortoxEmbed(VortoxColor.DEFAULT, "Skipping Turn", `${interaction.member.displayName} skipped ${newUser.name}'s turn.`, interaction.member);
            if (newUser.id === "DM")
                embed.setDescription(`Skipped <@${user.id}>'s turn.\nIt is now the DM's turn.`)
            else embed.setDescription(`Skipped <@${user.id}>'s turn.\nIt is now <@${newUser.id}>'s turn.`)
        }

        await interaction.reply({ embeds: [embed] });
    },
};
