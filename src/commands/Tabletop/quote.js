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
        let speaker, quote, location, image, color;

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`\`${id}\` Quote`);

        if (id === null) {
            let findSpeaker = 0;

            await Character.find().then(characters => {

                while(findSpeaker === 0) {
                    findSpeaker = characters[Math.floor(Math.random() * characters.length)];
                    if (findSpeaker.quotes.length === 0) findSpeaker = 0;
                }

                const randomQuote = findSpeaker.quotes[Math.floor(Math.random() * findSpeaker.quotes.length)];
                speaker = findSpeaker.name;
                quote = randomQuote.quote;
                location = randomQuote.location
                image = findSpeaker.image;
                color = findSpeaker.color;
            })
        }
        else {
            await Character.find({id: id}).then(character => {
                const randomQuote = character[0].quotes[Math.floor(Math.random() * character[0].quotes.length)];
                speaker = character[0].name;
                quote = randomQuote.quote;
                location = randomQuote.location;
                image = character[0].image;
                color = character[0].color;
            })
        }

        console.log(speaker + " said " + quote + " in " + location);

        embed.setDescription(`"${quote}"`)
             .setTitle("")
             .setAuthor({ name: `${speaker} Says...`, iconURL: image })
             .setFooter({ text: `${speaker} said this in ${location}` })
             .setColor(color);

        await interaction.reply({ embeds: [embed] });
    },
};