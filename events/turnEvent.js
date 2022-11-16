const { EpisodeUtils } = require("../utilities/episodeUtils");
const Character = require("../models/characters")
const { DiceRoller } = require("vortox-dice-parser");
const {VortoxEmbed} = require("../utilities/embeds");
const {VortoxColor} = require("../utilities/enums");

function statusToDetails(status) {
    switch (status) {
        case "on fire":
            return ["is Burning", "is on fire!"];
        case "poisoned":
            return ["is Poisoned", "is poisoned!"];
        case "bleeding":
            return ["is Bleeding", "is bleeding!"];
        default:
            return ["is an Error", "is nothing!"];
    }
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand() || interaction.ephemeral) return;
        const command = client.commands.get(interaction.commandName);

        if (!command) return

        let currentEpisode = await EpisodeUtils.currentEpisode(interaction.guildId);

        if (currentEpisode == null || interaction.channel.id !== currentEpisode.threadId)
            return;

        currentEpisode = await currentEpisode.populate({ path: 'players.user', populate: { path: 'character'}});

        if (currentEpisode.mode === "roleplay") {
            if (command.data.name !== "8ball" && command.data.name !== "choose" && command.data.name !== "roll") {
                return;
            }
        }
        else if (currentEpisode.mode === "combat") {
            if (command.data.name !== "8ball" && command.data.name !== "choose" && command.data.name !== "dmg") {
                return;
            }
        }

        const player = currentEpisode.players.find(x => x.turn === true);

        if (player.user == null) {
            if (interaction.member.roles.cache.find(role => role.id === player.role) === null)
                return;
        }
        else if (player.user.id !== interaction.member.id) return;

        if (currentEpisode.players.indexOf(player) === currentEpisode.players.length - 1)
            currentEpisode.turnCount++;

        player.turn = false;
        if (player.user != null) {
            let nick = ""
            if (currentEpisode.mode === "roleplay")
                nick = interaction.member.displayName.replace('🎱', '');
            else if (currentEpisode.mode === "combat")
                nick = interaction.member.displayName.replace('✊', '');

            if (nick.charAt(nick.length - 1) === ' ') nick = nick.slice(0, nick.length - 1);

            await EpisodeUtils.changeNickname(interaction, interaction.member, nick);
        }

        for (let i = 1; i <= currentEpisode.players.length; i++) {
            let temp = currentEpisode.players[(currentEpisode.players.indexOf(player) + i) % currentEpisode.players.length]
            if (!temp.hasLeft) {
                if (temp.user != null) {
                    let discordUser = await interaction.guild.members.fetch(temp.user.id);
                    let userNick = discordUser.displayName;

                    if (currentEpisode.mode === "roleplay") userNick = userNick + " 🎱";
                    else if (currentEpisode.mode === "combat") userNick = userNick + " ✊";

                    await EpisodeUtils.changeNickname(interaction, discordUser, userNick);
                }
                temp.turn = true;
                break;
            }
        }

        await currentEpisode.save();

        // Damage Over Time
        if (currentEpisode.players.indexOf(player) === currentEpisode.players.length - 1) {
            let list = await Character.find({ "meta.guildId": interaction.guildId });
            for (let character of list) {
                let status = character.game.damageOverTime;

                if (status.turnsLeft === 0 || status.turnsLeft === "")
                    continue;

                let roller = new DiceRoller(status.damageRoll);
                character.game.hp -= roller.getTotal();
                status.turnsLeft--;

                let damageStatusArray = statusToDetails(status.status);
                let damageEmbed = new VortoxEmbed(VortoxColor.DEFAULT, `${character.name} ${damageStatusArray[0]}`, `caused the round to end.`, interaction.member);

                let descriptionString = `${character.name} ${damageStatusArray[1]}\n` +
                    `${character.name} took ${roller.getTotal()} damage!\n` +
                    `${character.name} has \`${character.game.hp}\`/\`${character.game.maxHp}\` hp.`

                damageEmbed.setDescription(descriptionString);
                await interaction.channel.send({embeds: [damageEmbed]});

                if (status.turnsLeft === 0) {
                    status.status = "normal";
                    status.damageRoll = "";
                }

                await character.save()
            }
        }
    },
};
