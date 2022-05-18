const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const mongoose = require('mongoose');
const { characterSchema } = require('../../models/characters')
const {locationSchema} = require("../../models/locations");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Quote a character!')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The character to be quoted.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('location')
                .setDescription('The location to be quoted from.')
                .setRequired(false)),

    async execute(interaction) {

        let quotedChar = 0, randomQuote;
        const Character = mongoose.model('Character', characterSchema);

        let id = interaction.options.getString('id');
        let choiceLocation = interaction.options.getString('location');                

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`\`${id}\` Quote`);

        const ID = (id === null ? false : true);
        const LOC = (choiceLocation === null ? false : true);

        if (!ID && !LOC) {
            await Character.find().then(characters => {
                while(quotedChar === 0) {
                    quotedChar = characters[Math.floor(Math.random() * characters.length)];
                    if (quotedChar.quotes.length === 0 || (choiceLocation !== null && quotedChar.quotes.filter(value => value.location.toLowerCase() === choiceLocation).length === 0))
                        quotedChar = 0;
                }
            });
            
            // Never used...
            //randomQuote = quotedChar.quotes[Math.floor(Math.random() * quotedChar.quotes.length)];
        } else {
            switch(true) {
                case(ID):
                    try {
                        id = id.toLowerCase();
                        quotedChar = await Character.findOne({ id: id });
                        if (!quotedChar) throw new Error(`No document with id matching ${id} found.`);
                    } catch (err) {
                        console.log(err);
                        embed.setTitle('Quoting Failed')
                            .setDescription(`Character \`${id}\` does not exist!`);
                        interaction.reply({ embeds: [embed] });
                        return;
                    } finally {
                        break;
                    }
                case (LOC):
                    choiceLocation = choiceLocation.toLowerCase();
                    let Location = mongoose.model('Location', locationSchema);

                    await Location.findOne({ id: { $regex : new RegExp(choiceLocation, "i") } }).then((result) => {
                        if (result === null) {
                            embed.setTitle(`\`${choiceLocation}\` Quote`)
                                .setDescription(`Location \`${choiceLocation}\` does not exist!`);
                            return interaction.reply({ embeds: [embed] });
                        }
                    })
                    break;
            }

            if(LOC) {
                let tempArray = quotedChar.quotes.filter(value => value.location.toLowerCase() === choiceLocation);
                randomQuote = tempArray[Math.floor(Math.random() * tempArray.length)];
            } 
        }

        

        let speaker = quotedChar.name;
        let image = quotedChar.image;
        let color = quotedChar.color;
        let quote = randomQuote.quote;
        let location = randomQuote.location;

        embed.setDescription(`"${quote}"`)
             .setTitle("")
             .setAuthor({ name: `${speaker} Says...`, iconURL: image })
             .setFooter({ text: `${speaker} said this during ${location}.` })
             .setColor(color);

        await interaction.reply({ embeds: [embed] });
    },
};