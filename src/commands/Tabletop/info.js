const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const mongoose = require("mongoose");
const {characterSchema} = require("../../models/characters");
const {weaponSchema} = require("../../models/weapons");
const {typeSchema} = require("../../models/types");
const {locationSchema} = require("../../models/locations");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Gets information of a doc.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('character')
                .setDescription('Get information of a character.')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The character\'s id.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapon')
                .setDescription('Get information of a weapon.')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('Get information of a weapon type.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('type')
                .setDescription('Get information of a weapon type.')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The weapon type\'s id.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('location')
                .setDescription('Get information of a location.')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The location\'s id.'))),

    async execute(interaction) {
        const id = interaction.options.getString('id').toLowerCase();

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`\`${id}\` Info`)
            .setDescription(`\`${id}\` doesn't exist!`)

        let model;
        if (interaction.options.getSubcommand() === "character") model = mongoose.model('Character', characterSchema);
        else if (interaction.options.getSubcommand() === "weapon")  model = mongoose.model('Weapon', weaponSchema);
        else if (interaction.options.getSubcommand() === 'type') model = mongoose.model('Type', typeSchema);
        else if (interaction.options.getSubcommand() === 'location') model = mongoose.model('Location', locationSchema);

        let query = await model.findOne({ id: { $regex : new RegExp(id, "i") } }).then( result => {
            if (result === null) {
                return null;
            }
            return result;
        });

        if (query === null) return interaction.reply({ embeds: [embed] })

        if (interaction.options.getSubcommand() === "character") {
            embed
                .setTitle(query.name)
                .setDescription(query.description)
                .setColor(query.color)
                .setThumbnail(query.image)
                .addFields(
                    { name: "ID", value: `\`${query.id}\``, inline: true },
                    { name: "Health", value: `${query.hp}/${query.maxHp}`, inline: true },
                    { name: "Quotes", value: `${query.quotes.length}`, inline: true }
                );
        }

        else if (interaction.options.getSubcommand() === "weapon") {
            embed
                .setTitle(query.name)
                .setDescription(query.description)
                .setColor("#FFA500")
                .addFields(
                    { name: "ID", value: `\`${query.id}\``, inline: true },
                    { name: "Type", value: `${query.type}`, inline: true },
                    { name: "Damage Roll", value: `${query.damage}`, inline: true },
                );
        }
        else if (interaction.options.getSubcommand() === 'type') {
            embed
                .setTitle(id.charAt(0).toUpperCase() + id.slice(1))
                .setDescription("")
                .setColor("#FFA500")
                .addField('Miss Rate', `${query.missRate}%`, true );
        }
        else if (interaction.options.getSubcommand() === 'location') {
            embed
                .setTitle(`${query.id}`)
                .setDescription("")
                .setColor("#FFA500")
                .addField('Quote Count', `${query.count}`, true );
        }

        await interaction.reply({ embeds: [embed] });
    },
};
