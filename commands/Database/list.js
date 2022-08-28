const { SlashCommandBuilder } = require('@discordjs/builders');

const mongoose = require("mongoose");
const { characterSchema } = require("../../models/characters");
const { weaponSchema } = require("../../models/weapons");
const {episodeSchema} = require("../../models/episodes");
const {VortoxEmbed} = require("../../utilities/embeds");
const {VortoxColor} = require("../../utilities/enums");

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
        let model;
        let embed;

        if (interaction.options.getSubcommand() === 'characters') {
            model = mongoose.model("Characters", characterSchema);
            const characterList = await model.find( { "meta.guildId": interaction.guildId } ).sort('id');

            if (characterList.length === 0) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, 'Error Retrieving Character List', 'tried to retrieve the character list.', interaction.member);
                failEmbed.setDescription("No characters exist in this server!\nUse \`character add\` to add some!");
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            let idList = "";
            let nameList = "";
            let hpList = "";

            for (let character of characterList) {
                idList += `\`${character.id}\`\n`
                nameList += `\`${character.name}\`\n`
                hpList += `\`${character.game.hp}/${character.game.maxHp}\`\n`;
            }

            embed = new VortoxEmbed(VortoxColor.DEFAULT, "List of All Characters", 'retrieved the character list.', interaction.member);
            embed.addFields([
                { name: "ID", value: idList, inline: true },
                { name: "Name", value: nameList, inline: true },
                { name: "HP", value: hpList, inline: true }
            ]);
        }
        else if (interaction.options.getSubcommand() === 'weapons') {
            model = mongoose.model("Weapons", weaponSchema);
            const weaponList = await model.find( { guildId: interaction.guildId }).sort('id');

            if (weaponList.length === 0) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, 'Error Retrieving Weapon List', 'tried to retrieve the weapon list.', interaction.member);
                failEmbed.setDescription("No weapons exist in this server!\nUse \`weapon add\` to add some!");
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            let idList = "";
            let nameList = "";
            let typeList = "";

            for (let weapon of weaponList) {
                idList += `\`${weapon.id}\`\n`
                nameList += `\`${weapon.name}\`\n`
                typeList += `\`${weapon.damageType}\`\n`;
            }

            embed = new VortoxEmbed(VortoxColor.DEFAULT, "List of All Weapons", 'retrieved the weapon list.', interaction.member);
            embed.addFields([
                { name: "ID", value: idList, inline: true },
                { name: "Name", value: nameList, inline: true },
                { name: "Damage Type", value: typeList, inline: true }
            ]);
        }
        else if (interaction.options.getSubcommand() === 'episodes') {
            model = mongoose.model("Episodes", episodeSchema);
            const episodeList = await model.find( { guildId: interaction.guildId }).sort('id');

            if (episodeList.length === 0) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, 'Error Retrieving Episode List', 'tried to retrieve the episode list.', interaction.member);
                failEmbed.setDescription("No episodes exist in this server!\nUse \`episode start\` to start one!");
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            let idList = "";
            let nameList = "";
            let threadList = "";

            for (let episode of episodeList) {
                idList += `\`${episode.id}\`\n`
                nameList += `\`${episode.name}\`\n`
                threadList += `[Click Here](https://discord.com/channels/${interaction.guild.id}/${episode.threadId})\n`
            }

            embed = new VortoxEmbed(VortoxColor.DEFAULT, "List of All Episodes", 'retrieved the episode list.', interaction.member);
            embed.addFields([
                { name: "ID", value: idList, inline: true },
                { name: "Name", value: nameList, inline: true },
                { name: "Thread", value: threadList, inline: true }
            ]);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
