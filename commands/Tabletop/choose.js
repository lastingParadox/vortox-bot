const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const VortoxColor = require('../../utilities/enums')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('choose')
        .setDescription('Makes a choice from a set of items.')
        .addStringOption(option =>
            option.setName('list')
                .setDescription('The list of items to choose from, separated by " | ".')
                .setRequired(true)),

    async execute(interaction) {
        const list = interaction.options.getString('list');
        const array = list.split(" | ");

        let itemString = "";
        array.forEach((item, index) => {
            if (index === 0)
                itemString += item;
            else
                itemString += ", " + item;
        });

        const random = array[Math.floor(Math.random() * array.length)];

        const embed = new EmbedBuilder()
            .setColor(VortoxColor.DEFAULT)
            .setTitle(`${random}`)
            .setFooter({
                iconURL: interaction.member.displayAvatarURL(),
                text: `The list of options: ${itemString}`
            });

        await interaction.reply({ embeds: [embed] });
    },
};