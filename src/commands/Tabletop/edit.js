const { SlashCommandBuilder } = require('@discordjs/builders');
const { DiceRoller } = require('dice-roller-parser');
const roller = new DiceRoller();
const { MessageEmbed } = require('discord.js');

const mongoose = require("mongoose");
const { characterSchema } = require('../../models/characters')
const { weaponSchema } = require('../../models/weapons')
const { typeSchema } = require('../../models/types')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edits a weapon, weapon type, or character.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapon')
                .setDescription('Edit a pre-existing weapon.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The weapon\'s id to be edited.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('attribute')
                        .setDescription('The weapon\'s attribute to be edited. (id is 20 char MAX and name is 30 char MAX)')
                        .setRequired(true)
                        .addChoice('id', 'id')
                        .addChoice('name', 'name')
                        .addChoice('type', 'type')
                        .addChoice('damage', 'damage')
                        .addChoice('description', 'description'))
                .addStringOption(option =>
                    option.setName('edit')
                        .setDescription('The change to be given to the weapon\'s attribute.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('type')
                .setDescription('Edit a pre-existing weapon type.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The weapon type\'s id to be edited.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('attribute')
                        .setDescription('The weapon type\'s attribute to be edited. (id is 20 char MAX)')
                        .setRequired(true)
                        .addChoice('id', 'id')
                        .addChoice('missrate', 'missrate'))
                .addStringOption(option =>
                    option.setName('edit')
                        .setDescription('The change to be given to the type\'s attribute.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('character')
                .setDescription('Edit a pre-existing character.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The character\'s id to be edited.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('attribute')
                        .setDescription('The character\'s attribute to be edited. (id is 20 char MAX and name is 30 char MAX)')
                        .setRequired(true)
                        .addChoice('id', 'id')
                        .addChoice('name', 'name')
                        .addChoice('description', 'description')
                        .addChoice('hp', 'hp')
                        .addChoice('maxhp', 'maxhp')
                        .addChoice('image', 'image')
                        .addChoice('color', 'color'))
                .addStringOption(option =>
                    option.setName('edit')
                        .setDescription('The change to be given to the character\'s attribute.')
                        .setRequired(true))),

    async execute(interaction) {

        const id = interaction.options.getString('id').toLowerCase();
        const attribute = interaction.options.getString('attribute');
        const edit = interaction.options.getString('edit');

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Editing \`${id}\` Failed!`);

        if (attribute === "damage") {
            try {
                roller.roll(edit)
            } catch (err) {
                embed.setDescription(`Damage \`${edit}\` is not in a proper dice format!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }
        }

        let model;

        if (interaction.options.getSubcommand() === "character") {
            model = mongoose.model('Character', characterSchema);
        }
        else if (interaction.options.getSubcommand() === "weapon") {
            model = mongoose.model('Weapons', weaponSchema);
        }
        else if (interaction.options.getSubcommand() === 'type') {
            model = mongoose.model('Types', typeSchema);
        }

        try {
            const find = await model.findOne({ id: id })
            if (!find) throw new Error(`No document with id matching ${id} found.`);
            find[attribute] = edit;
            await find.save();
        } catch (err) {
            console.log(err);
            embed.setDescription(`\`${id}\` does not exist!`)
            interaction.reply({ embeds: [embed] });
            return;
        }


        embed.setColor('#FFA500')
            .setTitle(`Editing \`${id}\` Succeeded!`)
            .setDescription(`Successfully changed \`${id}\`'s \`${attribute}\` to \`${edit}\``);

        await interaction.reply({ embeds: [embed] });
    },
};
