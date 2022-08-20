const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { VortoxColor } = require('../../utilities/enums');
const {EpisodeUtils} = require("../../utilities/episodeUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('turn')
        .setDescription('Returns whose turn it is for the current episode.')
        .addSubcommand(subcommand =>
            subcommand.setName('show')
                .setDescription('Returns whose turn it is for the current episode.'))
        .addSubcommand(subcommand =>
            subcommand.setName('skip')
                .setDescription('Skips the current player for the current episode.')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const embed = new EmbedBuilder()
            .setTitle("Episode Turn")

        if (!EpisodeUtils.isCurrentEpisode()) {
            embed.setColor(VortoxColor.ERROR)
                .setDescription("There is no episode currently in progress!")
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} tried to do something that's not possible.`
                });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (subcommand === 'show') {

        const userList = EpisodeUtils.episodeArray.currentEpisode.episodeUsers;
        const user = userList.find(x => x.turn === true);

        embed.setColor(VortoxColor.DEFAULT)
            .setTitle("Episode Turn")
            .setDescription(`It's <@${user.id}>'s turn!`)
            .setFooter({
                iconURL: interaction.member.displayAvatarURL(),
                text: `${interaction.member.displayName} asked who has the turn currently.`
            });

        }

        else {
            const userList = EpisodeUtils.episodeArray.currentEpisode.episodeUsers;
            const user = userList.find(x => x.turn === true);
            const newUser = userList[(userList.indexOf(user) + 1) % userList.length];

            user.turn = false;
            newUser.turn = true;

            EpisodeUtils.save();

            embed.setColor(VortoxColor.DEFAULT)
                .setTitle("Skipping Turn")
                .setDescription(`Skipped <@${user.id}>'s turn.\nIt is now <@${newUser.id}>'s turn.`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} skipped <@${newUser.id}>'s turn.`
                });
        }

        await interaction.reply({ embeds: [embed] });
    },
};