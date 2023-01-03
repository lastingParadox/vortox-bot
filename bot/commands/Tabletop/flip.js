const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { VortoxColor } = require('../../utilities/enums');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Flips a coin!'),

    async execute(interaction) {

        const random = Math.floor(Math.random() * 2);
        let face;

        if (random === 0) face = "Heads";
        else face = "Tails"

        const embed = new EmbedBuilder()
            .setColor(VortoxColor.DEFAULT)
            .setTitle(`Coin Flip`)
            .setDescription(`${face}`)
            .setFooter({
                iconURL: interaction.member.displayAvatarURL(),
                text: `${interaction.member.displayName} flipped a coin and got ${face.toLowerCase()}`});

        await interaction.reply({ embeds: [embed] });
    }
}
