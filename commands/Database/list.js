const { SlashCommandBuilder } = require('@discordjs/builders');

const mongoose = require("mongoose");
const { characterSchema } = require("../../models/characters");
const { weaponSchema } = require("../../models/weapons");
const {episodeSchema} = require("../../models/episodes");
const { VortoxEmbed, VortoxPages } = require("../../utilities/embeds");
const { VortoxColor } = require("../../utilities/enums");

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

        if (interaction.options.getSubcommand() === 'characters') {
            model = mongoose.model("Characters", characterSchema);
            const characterList = await model.find( { "meta.guildId": interaction.guildId } ).sort('id');

            if (characterList.length === 0) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, 'Error Retrieving Character List', 'tried to retrieve the character list.', interaction.member);
                failEmbed.setDescription("No characters exist in this server!\nUse \`character add\` to add some!");
                await interaction.editReply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            let idList = "";
            let nameList = "";
            let hpList = "";
            let j = -1;

            for (let i = 0; i < characterList.length; i++) {
                if (i % 10 === 0) {
                    if (i !== 0) {
                        embeds[j].addFields([
                            { name: "ID", value: idList, inline: true },
                            { name: "Name", value: nameList, inline: true },
                            { name: "HP", value: hpList, inline: true }
                        ]);
                        idList = "";
                        nameList = "";
                        hpList = "";
                    }
                    embeds.push(new VortoxEmbed(VortoxColor.DEFAULT, "List of All Characters", 'retrieved the character list.', interaction.member));
                    j++;
                }

                idList += `\`${characterList[i].id}\`\n`
                nameList += `\`${characterList[i].name}\`\n`
                hpList += `\`${characterList[i].game.hp}/${characterList[i].game.maxHp}\`\n`;
            }

            if (idList !== "") {
                embeds[embeds.length - 1].addFields([
                    { name: "ID", value: idList, inline: true },
                    { name: "Name", value: nameList, inline: true },
                    { name: "HP", value: hpList, inline: true }
                ]);
            }
        }
        else if (interaction.options.getSubcommand() === 'weapons') {
            model = mongoose.model("Weapons", weaponSchema);
            const weaponList = await model.find( { guildId: interaction.guildId }).sort('id');

            if (weaponList.length === 0) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, 'Error Retrieving Weapon List', 'tried to retrieve the weapon list.', interaction.member);
                failEmbed.setDescription("No weapons exist in this server!\nUse \`weapon add\` to add some!");
                await interaction.editReply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            let idList = "";
            let nameList = "";
            let typeList = "";
            let j = -1;

            for (let i = 0; i < weaponList.length; i++) {
                if (i % 10 === 0) {
                    if (i !== 0) {
                        embeds[j].addFields([
                            { name: "ID", value: idList, inline: true },
                            { name: "Name", value: nameList, inline: true },
                            { name: "Damage Type", value: typeList, inline: true }
                        ]);
                        idList = "";
                        nameList = "";
                        typeList = "";
                    }
                    embeds.push(new VortoxEmbed(VortoxColor.DEFAULT, "List of All Weapons", 'retrieved the weapon list.', interaction.member));
                    j++;
                }

                idList += `\`${weaponList[i].id}\`\n`
                nameList += `\`${weaponList[i].name}\`\n`
                typeList += `\`${weaponList[i].damageType}\`\n`;
            }

            if (idList !== "") {
                embeds[embeds.length - 1].addFields([
                    { name: "ID", value: idList, inline: true },
                    { name: "Name", value: nameList, inline: true },
                    { name: "Damage Type", value: typeList, inline: true }
                ]);
            }
        }
        else if (interaction.options.getSubcommand() === 'episodes') {
            model = mongoose.model("Episodes", episodeSchema);
            const episodeList = await model.find( { guildId: interaction.guildId }).sort('id');

            if (episodeList.length === 0) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, 'Error Retrieving Episode List', 'tried to retrieve the episode list.', interaction.member);
                failEmbed.setDescription("No episodes exist in this server!\nUse \`episode start\` to start one!");
                await interaction.editReply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            let idList = "";
            let nameList = "";
            let threadList = "";
            let j = -1;

            for (let i = 0; i < episodeList.length; i++) {
                if (i % 10 === 0) {
                    if (i !== 0) {
                        embeds[j].addFields([
                            { name: "ID", value: idList, inline: true },
                            { name: "Name", value: nameList, inline: true },
                            { name: "Thread", value: threadList, inline: true }
                        ]);
                        idList = "";
                        nameList = "";
                        threadList = "";
                    }
                    embeds.push(new VortoxEmbed(VortoxColor.DEFAULT, "List of All Episodes", 'retrieved the episode list.', interaction.member));
                    j++;
                }

                idList += `\`${episodeList[i].id}\`\n`
                nameList += `\`${episodeList[i].name}\`\n`
                threadList += `[Click Here](https://discord.com/channels/${interaction.guild.id}/${episodeList[i].threadId})\n`
            }

            if (idList !== "") {
                embeds[embeds.length - 1].addFields([
                    { name: "ID", value: idList, inline: true },
                    { name: "Name", value: nameList, inline: true },
                    { name: "Thread", value: threadList, inline: true }
                ]);
            }
        }

        const embed = embeds[0];

        const pageReader = new VortoxPages(interaction, embeds, undefined, 1000 * 60 * 10);

        await interaction.editReply({ embeds: [embed], ephemeral: true, components: [pageReader.getRow()] })

        await pageReader.start();
    },
};
