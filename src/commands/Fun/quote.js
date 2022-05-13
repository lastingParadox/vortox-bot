const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const mongoose = require('mongoose');
const { characterSchema } = require('../../models/characters')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Quote a character!')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The character to be quoted.')
                .setRequired(false)),

    async execute(interaction) {
        let id = interaction.options.getString('id');

        if (id !== null) id = id.toLowerCase();

        const Character = mongoose.model('Character', characterSchema);
        let quotedChar = 0, randomQuote, speaker, quote, location, image, color;

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`\`${id}\` Quote`);

        if (id === null) {

            await Character.find().then(characters => {

                while(quotedChar === 0) {
                    quotedChar = characters[Math.floor(Math.random() * characters.length)];
                    if (quotedChar.quotes.length === 0) quotedChar = 0;
                }
            });
        }
        else {
            quotedChar = await Character.findOne({id: id});
        }

        if(quotedChar === null) {
            embed.setDescription(`Character \`${id}\` does not exist!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        randomQuote = quotedChar.quotes[Math.floor(Math.random() * quotedChar.quotes.length)];

        speaker = quotedChar.name;
        quote = randomQuote.quote;
        location = randomQuote.location;
        image = quotedChar.image;
        color = quotedChar.color;

        embed.setDescription(`"${quote}"`)
             .setTitle("")
             .setAuthor({ name: `${speaker} Says...`, iconURL: image })
             .setFooter({ text: `${speaker} said this during ${location}.` })
             .setColor(color);

        await interaction.reply({ embeds: [embed] });
    },
};