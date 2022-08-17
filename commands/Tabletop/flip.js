const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Flips a coin!'),

    async execute(interaction) {

        const random = Math.floor(Math.random() * 2);
        let face;

        if (random === 0) face = "Heads";
        else face = "Tails;"

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(`Coin Flip`)
            .setDescription(`${face}`)
            .setFooter(({ text: `${interaction.member.displayName} flipped a coin and got ${face.toLowerCase()}`}));

        await interaction.reply({ embeds: [embed] });
    }
}