const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { VortoxColor } = require('../../utilities/enums');
const fs = require('fs');
const path = require("path");
const Character = require("../../models/characters");
const {VortoxEmbed} = require("../../utilities/embeds");
const Weapon = require("../../models/weapons");
const List = require("../../models/lists");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds an object to the guild database.')
        .addSubcommand(subcommand => subcommand
            .setName('character')
            .setDescription('Adds a character to the guild database.')
            .addStringOption(option => option
                .setName('id')
                .setDescription('The identifier for the character to be used in commands.')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('weapon')
            .setDescription('Adds a weapon to the guild database.')
            .addStringOption(option => option
                .setName('id')
                .setDescription('The identifier for the weapon to be used in commands.')
                .setRequired(true)
            )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        let id = interaction.options.getString('id').toLowerCase();
        let rows = [];
        let type = "";
        let title = "";
        let footer = "";
        let embed;

        if (interaction.options.getSubcommand() === 'character') {
            type = "add_character";
            title = `Adding Character \`${id}\``;
            footer = "is creating a character.";

            const temp = await Character.findOne({ id: id, 'meta.guildId': interaction.guildId });
            if (temp) {
                const embedFail = new VortoxEmbed(VortoxColor.ERROR, `Character \`${id}\` Already Exists`,
                    `tried to add character ${id} to the guild database.`, interaction.member);
                embedFail.setDescription(`Character \`${id}\` already exists in this guild!`);
                return interaction.reply({embeds: [embedFail], ephemeral: true});
            }

            rows = [
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setCustomId('add_character_id').setStyle(ButtonStyle.PRIMARY).setLabel('ID').setEmoji('🪪'),
                    new ButtonBuilder().setCustomId('add_character_name').setStyle(ButtonStyle.PRIMARY).setLabel('Name').setEmoji('📛'),
                    new ButtonBuilder().setCustomId('add_character_hp').setStyle(ButtonStyle.PRIMARY).setLabel('HP').setEmoji('❤'),
                    new ButtonBuilder().setCustomId('add_character_description').setStyle(ButtonStyle.PRIMARY).setLabel('Description').setEmoji('📝'),
                ]),
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setCustomId('add_character_shield').setStyle(ButtonStyle.PRIMARY).setLabel('Shield').setEmoji('🛡'),
                    new ButtonBuilder().setCustomId('add_character_incorporeal').setStyle(ButtonStyle.PRIMARY).setLabel('Incorporeal').setEmoji('👻'),
                    new ButtonBuilder().setCustomId('add_character_resistances').setStyle(ButtonStyle.SECONDARY).setLabel('Resistances Page').setEmoji('☠'),
                ]),
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setCustomId('add_character_image').setStyle(ButtonStyle.PRIMARY).setLabel('Image').setEmoji('🖼'),
                    new ButtonBuilder().setCustomId('add_character_color').setStyle(ButtonStyle.PRIMARY).setLabel('Color').setEmoji('🌈'),
                    new ButtonBuilder().setCustomId('add_character_author').setStyle(ButtonStyle.PRIMARY).setLabel('Author').setEmoji('✍'),
                ]),
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setCustomId('add_character_finish').setStyle(ButtonStyle.SUCCESS).setLabel('Finish'),
                    new ButtonBuilder().setCustomId('add_character_delete').setStyle(ButtonStyle.DANGER).setLabel('Delete'),
                ]),
            ]

            let resistString = '```' +
                'Sharp'.padEnd(11, ' ') + '🗡️: 00%   ' + 'Blunt'.padEnd(11, ' ') + '🔨: 00%\n' +
                'Explosive'.padEnd(11, ' ') + '💥️: 00%   ' + 'Plasma'.padEnd(11, ' ') + '🔮: 00%\n' +
                'Fire'.padEnd(11, ' ') + '🔥: 00%   ' + 'Freeze'.padEnd(11, ' ') + '❄: 00%\n' +
                'Shock'.padEnd(11, ' ') + '⚡: 00%   ' + 'Chemical'.padEnd(11, ' ') + '🧪: 00%' + '```';

            const embed = new VortoxEmbed(VortoxColor.DEFAULT, title, footer, interaction.member);
            embed.addFields([
                { name: "General", value: `\`\`\`🪪: ${id}\`\`\``, inline: true },
                { name: "\u200b", value: `\`\`\`📛: ${id}\`\`\``, inline: true },
                { name: "\u200b", value: `\`\`\`❤: 20/20\`\`\``, inline: true },
                { name: "\u200b", value: `\`\`\`📝: Character description here.\`\`\``, inline: false },
                { name: "Game", value: `\`\`\`🛡: 0\`\`\``, inline: false },
                { name: "\u200b", value: `\`\`\`👻: False\`\`\``, inline: true },
                { name: "Resistances", value: resistString, inline: false },
                { name: "Meta", value: `\`\`\`🌈: #FFAA00\`\`\``, inline: false},
                { name: "\u200b", value: `\`\`\`✍: <@${interaction.author.id}>\`\`\``, inline: true},
            ]);
        }
        else if (interaction.options.getSubcommand() === 'weapon') {
            type = "add_weapon";
            title = `Adding Weapon \`${id}\``;
            footer = "is creating a weapon.";

            const temp = await Weapon.findOne({ id: id, 'meta.guildId': interaction.guildId });
            if (temp) {
                const embedFail = new VortoxEmbed(VortoxColor.ERROR, `Weapon \`${id}\` Already Exists`,
                    `tried to add weapon ${id} to the guild database.`, interaction.member);
                embedFail.setDescription(`Weapon \`${id}\` already exists in this guild!`);
                return interaction.reply({embeds: [embedFail], ephemeral: true});
            }

            rows = [
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setCustomId('add_weapon_id').setStyle(ButtonStyle.PRIMARY).setLabel('ID').setEmoji('🪪'),
                    new ButtonBuilder().setCustomId('add_weapon_name').setStyle(ButtonStyle.PRIMARY).setLabel('Name').setEmoji('📛'),
                    new ButtonBuilder().setCustomId('add_weapon_description').setStyle(ButtonStyle.PRIMARY).setLabel('Description').setEmoji('📝'),
                ]),
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setCustomId('add_weapon_damage').setStyle(ButtonStyle.PRIMARY).setLabel('Damage Roll').setEmoji('🎲'),
                    new ButtonBuilder().setCustomId('add_weapon_missRate').setStyle(ButtonStyle.SECONDARY).setLabel('Accuracy').setEmoji('🎯'),
                ]),
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setCustomId('add_weapon_types').setStyle(ButtonStyle.PRIMARY).setLabel('Damage Types').setEmoji('⚔'),
                    new ButtonBuilder().setCustomId('add_weapon_afflictions').setStyle(ButtonStyle.SECONDARY).setLabel('Ailments').setEmoji('🔥'),
                    new ButtonBuilder().setCustomId('add_character_author').setStyle(ButtonStyle.PRIMARY).setLabel('Author').setEmoji('✍'),
                ]),
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder().setCustomId('add_weapon_finish').setStyle(ButtonStyle.SUCCESS).setLabel('Finish'),
                    new ButtonBuilder().setCustomId('add_weapon_delete').setStyle(ButtonStyle.DANGER).setLabel('Delete'),
                ]),
            ]

            const embed = new VortoxEmbed(VortoxColor.DEFAULT, title, footer, interaction.member);
            embed.addFields([
                { name: "General", value: `\`\`\`🪪: ${id}\`\`\``, inline: true },
                { name: "\u200b", value: `\`\`\`📛: ${id}\`\`\``, inline: true },
                { name: "\u200b", value: `\`\`\`📝: Weapon description here.\`\`\``, inline: false },
                { name: "Game", value: `\`\`\`🎲: d6\`\`\``, inline: false },
                { name: "\u200b", value: `\`\`\`🎯: 80%\`\`\``, inline: true },
                { name: "Types", value: `\`\`\`Sharp\`\`\``, inline: false },
                { name: "Ailments", value: `\`\`\`None\`\`\``, inline: false },
                { name: "\u200b", value: `\`\`\`✍: <@${interaction.author.id}>\`\`\``, inline: false},
            ]);
        }

        const message = await interaction.fetchReply();

        const newList = await new List({
            _id: new mongoose.Types.ObjectId(),
            messageId: message.id,
            type: type,
            title: title,
            footer: footer,
            selectedIndex: 0,
            guildId: interaction.guildId
        })

        if (interaction.options.getSubcommand() === "character") {
            newList.character = {
                id: id,
                name: id,
                description: "Character description here.",

                game: {
                    hp: 20,
                    maxHp: 20,
                    shield: 0,
                    incorporeal: false,
                    resistances: {
                        sharp: 0,
                        blunt: 0,
                        explosive: 0,
                        plasma: 0,
                        laser: 0,
                        fire: 0,
                        freeze: 0,
                        shock: 0,
                        biological: 0
                    },
                },
                meta: {
                    image: "https://polybit-apps.s3.amazonaws.com/stdlib/users/discord/profile/image.png",
                    color: VortoxColor.DEFAULT,
                    author: interaction.author.id
                },
            }
        }
        else {
            newList.weapon = {
                id: id,
                name: id,
                description: "Weapon description here.",

                damageTypes: ["Sharp"],
                ailments: [],
                damage: "d6",
                missRate: 20,

                author: interaction.author.id
            }
        }

        await newList.save();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
