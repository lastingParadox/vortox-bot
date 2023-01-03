const { SlashCommandBuilder } = require('@discordjs/builders');

const Character = require("../../models/characters");
const Weapon = require("../../models/weapons");
const Episode = require("../../models/episodes");
const { VortoxEmbed } = require("../../utilities/embeds");
const { VortoxColor } = require("../../utilities/enums");
const List = require("../../models/lists");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Lists items from the database.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('characters')
                .setDescription('List all characters.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapons')
                .setDescription('List all weapons.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('episodes')
                .setDescription('List all episodes.')
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const embeds = [];
        let model;
        let type = "";
        let title = "";
        let footer = "";
        let idList = "";
        let nameList = "";
        let miscList = "";

        if (interaction.options.getSubcommand() === 'characters') {
            type = "characters";
            title = "List of All Characters";
            footer = "retrieved the character list.";

            const characterList = await Character.find( { "meta.guildId": interaction.guildId } ).sort('id');

            if (characterList.length === 0) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, 'Error Retrieving Character List', 'tried to retrieve the character list.', interaction.member);
                failEmbed.setDescription("No characters exist in this server!\nUse \`character add\` to add some!");
                await interaction.editReply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            for (let i = 0; i < characterList.length; i++) {
                if (i !== 0 && i % 10 === 0) {
                    embeds.push({ id: idList, name: nameList, misc: miscList });
                    idList = "";
                    nameList = "";
                    miscList = "";
                }

                idList += `\`${characterList[i].id}\`\n`
                nameList += `\`${characterList[i].name}\`\n`
                miscList += `\`${characterList[i].game.hp}/${characterList[i].game.maxHp}\`\n`;
            }

            if (idList !== "") {
                embeds.push({ id: idList, name: nameList, misc: miscList });
            }
        }
        else if (interaction.options.getSubcommand() === 'weapons') {
            type = "weapons";
            title = "List of All Weapons";
            footer = "retrieved the weapon list.";

            const weaponList = await Weapon.find( { guildId: interaction.guildId }).sort('id');

            if (weaponList.length === 0) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, 'Error Retrieving Weapon List', 'tried to retrieve the weapon list.', interaction.member);
                failEmbed.setDescription("No weapons exist in this server!\nUse \`weapon add\` to add some!");
                await interaction.editReply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            for (let i = 0; i < weaponList.length; i++) {
                if (i !== 0 && i % 10 === 0) {
                    embeds.push({ id: idList, name: nameList, misc: miscList });
                    idList = "";
                    nameList = "";
                    miscList = "";
                }

                idList += `\`${weaponList[i].id}\`\n`
                nameList += `\`${weaponList[i].name}\`\n`
                miscList += `\`${weaponList[i].damageType}\`\n`;
            }

            if (idList !== "") {
                embeds.push({ id: idList, name: nameList, misc: miscList });
            }
        }
        else if (interaction.options.getSubcommand() === 'episodes') {
            type = "episodes";
            title = "List of All Episodes";
            footer = "retrieved the episode list.";

            const episodeList = await Episode.find( { guildId: interaction.guildId }).sort('id');

            if (episodeList.length === 0) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, 'Error Retrieving Episode List', 'tried to retrieve the episode list.', interaction.member);
                failEmbed.setDescription("No episodes exist in this server!\nUse \`episode start\` to start one!");
                await interaction.editReply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            for (let i = 0; i < episodeList.length; i++) {
                if (i !== 0 && i % 10 === 0) {
                    embeds.push({ id: idList, name: nameList, misc: miscList });
                    idList = "";
                    nameList = "";
                    miscList = "";
                }

                idList += `\`${episodeList[i].id}\`\n`
                nameList += `\`${episodeList[i].name}\`\n`
                miscList += `[Click Here](https://discord.com/channels/${interaction.guild.id}/${episodeList[i].threadId})\n`
            }

            if (idList !== "") {
                embeds.push({ id: idList, name: nameList, misc: miscList });
            }
        }

        const row = new ActionRowBuilder()

        row.addComponents([
            new ButtonBuilder()
                .setCustomId('first_embed')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⏮')
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('prev_embed')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⏪')
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('next_embed')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⏩')
                .setDisabled(embeds.length === 1),
            new ButtonBuilder()
                .setCustomId('last_embed')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⏭')
                .setDisabled(embeds.length === 1),
        ])

        const embed = new VortoxEmbed(VortoxColor.DEFAULT, title, footer, interaction.member);
        embed.addFields([
            { name: "ID", value: embeds[0].id, inline: true },
            { name: "Name", value: embeds[0].name, inline: true }
        ]);

        if (type === "characters") embed.addFields({ name: "HP", value: embeds[0].misc, inline: true });
        else if (type === "weapons") embed.addFields({ name: "Damage Type", value: embeds[0].misc, inline: true });
        if (type === "episodes") embed.addFields({ name: "Thread", value: embeds[0].misc, inline: true });

        const message = await interaction.fetchReply();

        const newList = await new List({
            _id: new mongoose.Types.ObjectId(),
            messageId: message.id,
            type: type,
            title: title,
            footer: footer,
            embeds: embeds,
            selectedIndex: 0,
            guildId: interaction.guildId
        })

        await newList.save();

        await interaction.editReply({ embeds: [embed], components: [row] })

    },
};
