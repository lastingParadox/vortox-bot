const { SlashCommandBuilder } = require('@discordjs/builders');
const { DiceRoller } = require('dice-roller-parser');
const { MessageEmbed } = require('discord.js');

const mongoose = require("mongoose");
const { characterSchema } = require('../../models/characters')
const { weaponSchema } = require('../../models/weapons')
const { typeSchema } = require('../../models/types')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Adds a weapon or weapon type to the list.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapon')
                .setDescription('Adds a weapon to the list.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The weapon\'s id to be used in commands. (20 char MAX)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('The weapon\'s weapon type.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('damage')
                        .setDescription('The weapon\'s damage roll.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('type')
                .setDescription('Adds a weapon type to the list.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The weapon type\'s id to be used in commands. (20 char MAX)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('missrate')
                        .setDescription('The type\'s miss rate, in percentage.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('character')
                .setDescription('Adds a character to the list.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('The character\'s id to the used in commands. (20 char MAX)')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('hp')
                        .setDescription('The character\'s hp, between 1 and 50.'))),

	async execute(interaction) {

        const id = interaction.options.getString('id').toLowerCase();

        let addType = interaction.options.getSubcommand();
        addType = addType.charAt(0).toUpperCase() + addType.substring(1);

        const embed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle(`Adding ${addType} \`${id}\` Failed!`);

        if (id.length > 20) {
            embed.setDescription(`ID ${id} is over 20 characters!`);
            await interaction.reply({ embeds: [embed] });
            return;
        }

        if (addType === 'Weapon') {
            const type = interaction.options.getString('type');
            const damage = interaction.options.getString('damage');
            const roller = new DiceRoller();

            try {
                roller.roll(damage);
            } catch (err) {
                embed.setDescription(`Damage \`${damage}\` is not in a proper dice format!`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            const Weapon = mongoose.model('Weapon', weaponSchema);
            const newWeapon = new Weapon({ id: id, name: (id.charAt(0).toUpperCase() + id.slice(1)), type: type, damage: damage, description: "Use `/edit weapon` to change this!", guildId: interaction.guildId })

            try {
                await newWeapon.save();
                console.log("Saved!");
            } catch (err) {
                console.log(err);
                embed.setDescription("Weapon ID needs to be unique!");
                await interaction.reply({ embeds: [embed] });
                return;
            }

            embed.setDescription(`Successfully added \`${id}\` with damage roll \`${damage}\` to the weapon list!`);

        }

        else if (addType === 'Type') {
            const missrate = interaction.options.getString('missrate');

            const Type = mongoose.model('Type', typeSchema);
            const newType = new Type({ id: id, missRate: missrate, guildId: interaction.guildId });

            try {
                await newType.save();
                console.log("Saved!");
            } catch (err) {
                console.log(err);
                if (err.name === "MongoServerError") embed.setDescription("Type ID needs to be unique!");
                else embed.setDescription("Miss rate needs to be between 0 and 100!");
                await interaction.reply({ embeds: [embed] });
                return;
            }

            embed.setDescription(`Successfully added \`${id}\` with miss rate \`${missrate}%\` to the weapon types list!`);
        }

        else if (addType === 'Character') {
            let hp = interaction.options.getInteger('hp');
            if (hp === null) {
                hp = 30;
            }

            const Character = mongoose.model('Character', characterSchema);
            const newCharacter = new Character({ id: id, name: (id.charAt(0).toUpperCase() + id.slice(1)), description: "Use `/edit character` to change this!", hp: hp, maxHp: hp, image: "", color: "#FFA500", guildId: interaction.guildId });

            try {
                await newCharacter.save();
                console.log("Saved!");
            } catch (err) {
                console.log(err);
                embed.setDescription("Character ID needs to be unique!");
                await interaction.reply({ embeds: [embed] });
                return;
            }

            embed.setDescription(`Successfully added \`${id}\` with \`${hp}\` hp to the characters list!`);
        }

        embed.setColor('#50C878');
        embed.setTitle(`Adding ${id} Succeeded!`);

        await interaction.reply({ embeds: [embed] });

	},
};
