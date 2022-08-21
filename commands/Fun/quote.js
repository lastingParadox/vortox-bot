const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const mongoose = require("mongoose");
const { characterSchema } = require("../../models/characters");
const { locationSchema } = require("../../models/locations");

const { VortoxColor } = require('../../utilities/enums');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Returns a quote.')
        .addStringOption(option =>
            option.setName('character_id')
                .setDescription('The character to retrieve the quote from. Optional.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('location_id')
                .setDescription('The location to retrieve the quote from. Optional.')
                .setRequired(false)),

    async execute(interaction) {
        const characterId = interaction.options.getString('character_id');
        const locationId = interaction.options.getString('location_id');

        const embed = new EmbedBuilder();

        const Character = mongoose.model("Characters", characterSchema);
        const Location = mongoose.model("Locations", locationSchema);
        const locationList = await Location.find();

        let chosenCharacter;

        if (characterId !== null && locationId !== null ) {
            chosenCharacter = await Character.findOne({ id: characterId, locations: locationId, quoteAmount: { $gt: 0 } });
            if (chosenCharacter === null) {
                embed.setColor(VortoxColor.ERROR)
                    .setTitle('Retrieving Quote')
                    .setDescription(`Location \`${locationId}\` does not exist for character \`${characterId}\`!`)
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to get a quote.`
                    });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        else if (characterId !== null && locationId === null) {
            chosenCharacter = await Character.findOne({ id: characterId, quoteAmount: { $gt: 0 } });
            if (chosenCharacter === null) {
                embed.setColor(VortoxColor.ERROR)
                    .setTitle('Retrieving Quote')
                    .setDescription(`Character \`${characterId}\` does not exist!`)
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to get a quote.`
                    });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        else {
            let characterArray;

            if(locationId !== null)
                characterArray = await Character.find({ locations: locationId, quoteAmount: { $gt: 0 } });
            else
                characterArray = await Character.find({ quoteAmount: { $gt: 0 } });

            if (characterArray.length === 0) {
                embed.setColor(VortoxColor.ERROR)
                    .setTitle('Retrieving Quote')
                    .setDescription('There are no characters with quotes to retrieve from!')
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to get a quote.`
                    });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const quoteCharacter = await Character.aggregate([
                { $match: { quoteAmount: { $gt: 0 } } },
                { $group: { _id: null, amount: { $sum: "$quoteAmount" } } }
            ]);

            let total = quoteCharacter[0].amount;

            let random = Math.floor(Math.random() * total);

            for (let character of characterArray) {
                random -= character.quoteAmount;
                if (random <= 0) {
                    chosenCharacter = character;
                    break;
                }
            }
        }

        let quoteArray;

        if (locationId !== null)
            quoteArray = chosenCharacter.quotes.filter(quote => quote.location);
        else
            quoteArray = chosenCharacter.quotes;

        let chosenQuote = quoteArray[Math.floor(Math.random() * quoteArray.length)];
        let locationName;

        for (let location of locationList) {
            if (chosenQuote.location === location.id) {
                locationName = location.name;
                break;
            }
        }

        embed.setColor(chosenCharacter.meta.color)
            .setAuthor({
                name: `${chosenCharacter.name} says...`,
                iconURL: chosenCharacter.meta.image
            })
            .addFields([
                { name: 'Quote', value: chosenQuote.quote, inline: true },
                { name: 'Location', value: locationName, inline: true }
            ])
            .setFooter({
                text: `${interaction.member.displayName} retrieved a quote from ${chosenCharacter.name}.`,
                iconURL: interaction.member.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    },
};