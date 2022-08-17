const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Shakes the 8ball!')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask the 8ball.')
                .setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('question');

        const categories = JSON.parse(fs.readFileSync(process.cwd() + `\\items\\8ball.json`, 'utf8'));

        const probability = Math.floor(Math.random() * 100) + 1;

        let response;

        //YES
        if (probability <= 50) {
            let responseList = categories[0].responses;
            const random = Math.floor(Math.random() * responseList.length);
            response = responseList[random];
        }
        //NO
        else if (probability > 50 && probability <= 75) {
            let responseList = categories[1].responses;
            const random = Math.floor(Math.random() * responseList.length);
            response = responseList[random];
        }
        //MISC
        else {
            let responseList = categories[2].responses;
            const random = Math.floor(Math.random() * responseList.length);
            response = responseList[random];
        }

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(`8ball Response`)
            .setDescription(`${response}`)
            .setFooter(({ text: `${interaction.member.displayName} asked: "${question}`}));

        await interaction.reply({ embeds: [embed] });
    }
}