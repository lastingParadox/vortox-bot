const { EpisodeUtils } = require("../utilities/episodeUtils");
const Character = require("../models/characters");
const { DiceRoller } = require("vortox-dice-parser");
const { VortoxEmbed } = require("../utilities/embeds");
const { VortoxColor } = require("../utilities/enums");

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

        const currentEpisode = EpisodeUtils.isCurrentEpisode(interaction.guildId);

        if (!command || currentEpisode == null || interaction.channel.id !== currentEpisode.threadId || !EpisodeUtils.isCombat(interaction.guildId))
            return;

        if (command.data.name !== "dmg" && command.data.name !== "heal") return;

        const combatSequence = currentEpisode.combat;

        const player = combatSequence.players.find(x => x.turn === true);

        if (player.id !== interaction.member.id) return;

        if (combatSequence.players.indexOf(player) === combatSequence.players.length - 1) {
            combatSequence.turn++;
            for (let playerCharacter of combatSequence.players) {
                if (playerCharacter.damageOverTime.turnsLeft > 0) {
                    let character = await Character.findOne({ _id: player.character });
                    let roller = new DiceRoller(player.damageOverTime.damageRoll);
                    character.game.hp -= roller.getTotal();
                    playerCharacter.damageOverTime.turnsLeft--;

                    let statusArray = statusToDetails(playerCharacter.damageOverTime.status);
                    let damageEmbed = new VortoxEmbed(VortoxColor.DEFAULT, `${character.name} ${statusArray[0]}`, `caused the combat turn to change.`, interaction.member);

                    let descriptionString = `${character.name} ${statusArray[1]}\n` +
                                            `${character.name} took ${roller.getTotal()} damage!\n` +
                                            `${character.name} has \`${character.game.hp}\`/\`${character.game.maxHp}\` hp.`

                    damageEmbed.setDescription(descriptionString);
                    await interaction.channel.send({ embeds: [damageEmbed] });
                }
            }
        }

        player.turn = false;
        let nick = interaction.member.displayName.replace('⚔', '');
        if (nick.charAt(nick.length - 1) === ' ') nick = nick.slice(0, nick.length - 1);

        await EpisodeUtils.changeNickname(interaction, interaction.member, nick);

        let temp = combatSequence.players[(combatSequence.players.indexOf(player) + 1) % combatSequence.players.length]
        temp.turn = true;

        let discordUser = await interaction.guild.members.cache.get(temp.id);
        let userNick = discordUser.displayName;

        if (userNick.charAt(userNick.length - 1) === '🎱') userNick = userNick + '⚔';
        else userNick = userNick + ' ⚔';
        await EpisodeUtils.changeNickname(interaction, discordUser, userNick);

        await EpisodeUtils.currentEpisode.save();
    },
};
