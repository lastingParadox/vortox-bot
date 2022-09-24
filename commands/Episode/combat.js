const { SlashCommandBuilder } = require('@discordjs/builders');
const { VortoxColor } = require('../../utilities/enums');
const { EpisodeUtils } = require("../../utilities/episodeUtils");
const { VortoxEmbed } = require("../../utilities/embeds");
const Character = require("../../models/characters");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('combat')
        .setDescription('Commands related to combat during an episode.')
        .addSubcommand(subcommand =>
            subcommand.setName("start")
                .setDescription("Starts a combat sequence in the current episode. Limit one combat sequence.")
                .addStringOption(option =>
                    option.setName("character_id")
                        .setDescription("The character that you will play as in the combat sequence.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("join")
                .setDescription("Adds you and the character you will play as to the current combat sequence.")
                .addStringOption(option =>
                    option.setName("character_id")
                        .setDescription("The character that you will play as in the combat sequence.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("turn")
                .setDescription("Retrieves the current combat sequence's turn.")
        )
        .addSubcommand(subcommand =>
            subcommand.setName("list")
                .setDescription("Retrieves the current combat sequence's turn list.")
        )
        .addSubcommand(subcommand =>
            subcommand.setName("stop")
                .setDescription("Stops the current combat sequence and deletes it from the episode.")
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let id = interaction.options.getString('character_id')
        if (id) id = id.toLowerCase();

        if (subcommand === "join" || subcommand === "turn" || subcommand === "stop")
            if (!EpisodeUtils.isCombat()) {
                const embed = new VortoxEmbed(VortoxColor.ERROR, "Error Accessing Combat Command", "tried to do a command.", interaction.member);
                embed.setDescription("There is no ongoing combat sequence!")
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

        if (subcommand === "start") {
            if (EpisodeUtils.isCombat()) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, "Error Starting Combat", "tried to start a combat sequence.", interaction.member);
                failEmbed.setDescription("There is already an ongoing combat sequence!")
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            const character = await Character.findOne({ id: id, "meta.guildId": interaction.guildId });

            if (character == null) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, "Error Starting Combat", "tried to start a combat sequence.", interaction.member);
                failEmbed.setDescription(`Character \`${id}\` does not exist in the guild database!`)
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            const player = {
                id: interaction.member.id,
                name: interaction.member.displayName,
                turn: true,
                character: mongoose.Types.ObjectId(character._id),
                damageOverTime: {
                    status: "",
                    damageRoll: "0",
                    turnsLeft: 0
                }
            }

            EpisodeUtils.currentEpisode.combat.players.push(player);
            EpisodeUtils.currentEpisode.combat.turn = 1;

            await EpisodeUtils.currentEpisode.save();

            const embed = new VortoxEmbed(VortoxColor.DEFAULT, "Starting Combat", "initiated a combat sequence.", interaction.member);
            embed.setDescription(`${character.name} started combat!`);

            return interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === "join") {
            const character = await Character.findOne({ id: id, guildId: interaction.guildId });

            if (character == null) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, "Error Joining Combat", "tried to join a combat sequence.", interaction.member);
                failEmbed.setDescription(`Character \`${id}\` does not exist in the guild database!`)
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            if (EpisodeUtils.currentEpisode.combat.players.find(x => x.character.toString() === character._id.toString())) {
                const failEmbed = new VortoxEmbed(VortoxColor.ERROR, "Error Joining Combat", "tried to join a combat sequence.", interaction.member);
                failEmbed.setDescription(`Character \`${id}\` is already in the combat sequence!`)
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
                return;
            }

            const player = {
                id: interaction.member.id,
                name: interaction.member.displayName,
                turn: false,
                character: mongoose.Types.ObjectId(character._id),
                damageOverTime: {
                    status: "",
                    damageRoll: "0",
                    turnsLeft: 0
                }
            }

            EpisodeUtils.currentEpisode.combat.players.push(player);

            await EpisodeUtils.currentEpisode.save();

            const embed = new VortoxEmbed(VortoxColor.DEFAULT, "Joining Combat", "joined the ongoing combat sequence.", interaction.member);
            embed.setDescription(`${character.name} joined combat!`);

            return interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === "turn") {

            await EpisodeUtils.currentEpisode.populate('combat.players.character');

            const embed = new VortoxEmbed(VortoxColor.DEFAULT, "Combat Turn", `asked who has the turn currently.`, interaction.member);
            let player = EpisodeUtils.currentEpisode.combat.players.find(x => x.turn === true);
            embed.setDescription(`It's <@${player.id}>'s (as \`${player.character.name}\`) turn!`);

            return interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === "list") {
            let populatedPlayers = await EpisodeUtils.currentEpisode.populate('combat.players.character');
            populatedPlayers = populatedPlayers.combat;

            const embed = new VortoxEmbed(VortoxColor.DEFAULT, "Combat Turn List", "got the turn list.", interaction.member);

            let userString = "";
            for (let player of populatedPlayers.players) {
                if (player.turn === false)
                    userString += `🟦 <@${player.id}> as \`${player.character.name}\`\n`;
                else
                    userString += `✅ <@${player.id}> as \`${player.character.name}\`\n`;
            }
            embed.setDescription(userString);

            return interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === "stop") {

            EpisodeUtils.currentEpisode.combat = {};
            await EpisodeUtils.currentEpisode.save();
            let embed = new VortoxEmbed(VortoxColor.DEFAULT, "Stopping Combat", "stopped the current combat sequence", interaction.member);
            embed.setDescription("Stopped the combat sequence.");
            return interaction.reply({ embeds: [embed] });
        }
    },
};
