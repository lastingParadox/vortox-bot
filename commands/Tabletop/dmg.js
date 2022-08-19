const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const mongoose = require("mongoose");
const { characterSchema } = require("../../models/characters");
const { weaponSchema } = require("../../models/weapons");

const { DiceRoller, RollInitializeError } = require("vortox-dice-parser");
const { VortoxColor } = require('../../utilities/enums');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('dmg')
        .setDescription('Damages a character. (Requires ongoing episode.)')
        .addSubcommand(subcommand =>
            subcommand.setName('weapon')
                .setDescription('Damages a character with the provided weapon.')
                .addStringOption(option =>
                    option.setName('char_id')
                        .setDescription('The character\'s id. Required.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('weapon_id')
                        .setDescription('The weapon\'s id. Required.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('multiplier')
                        .setDescription('The amount of times for the weapon to hit. Optional.')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('roll')
                .setDescription('Damages a character with the provided dice expression.')
                .addStringOption(option =>
                    option.setName('char_id')
                        .setDescription('The character\'s id. Required.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('expression')
                        .setDescription('The dice expression to deal damage. Required.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('damage_type')
                        .setDescription('The damage type of the damage roll. Optional.')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Sharp', value: 'sharp' },
                            { name: 'Blunt', value: 'blunt' },
                            { name: 'Explosive', value: 'explosive' },
                            { name: 'Plasma', value: 'plasma' },
                            { name: 'Laser', value: 'laser' },
                            { name: 'Fire', value: 'fire' },
                            { name: 'Freeze', value: 'freeze' },
                            { name: 'Shock', value: 'shock' },
                            { name: 'Biological', value: 'biological' },
                        )
                )
        ),

    async execute(interaction) {
        const id = interaction.options.getString('char_id');
        const damage = interaction.options.getSubcommand();
        const embed = new EmbedBuilder()
            .setTitle(`Damaging \`${id}\``);

        let roller
        let totalDamage;
        const Character = mongoose.model("Characters", characterSchema);

        const target = await Character.findOne({ id: id });

        if (!target) {
            embed.setColor(VortoxColor.ERROR)
                .setDescription(`Character \`${id}\` does not exist!`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} tried to damage ${id}.`
                });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        embed.setTitle(`Damaging ${target.name}`)

        if (damage === 'weapon') {
            const weaponId = interaction.options.getString('weapon_id');
            let multiplier = interaction.options.getInteger('multiplier');

            if (multiplier === null)
                multiplier = 1;

            const Weapon = mongoose.model("Weapons", weaponSchema)
            const weapon = await Weapon.findOne({ id: weaponId });

            if (!weapon) {
                embed.setColor(VortoxColor.ERROR)
                    .setDescription(`Weapon \`${id}\` does not exist!`)
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to damage ${target.name}.`
                    });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const random = Math.floor(Math.random() * 100) + 1;

            if (random <= weapon.missRate) {
                embed.setColor(VortoxColor.MISS)
                    .setDescription(`Rolling for ${weapon.name} accuracy...\n` +
                    `Rolled a \`${random}\`!\n` +
                    `${weapon.name}'s miss rate is \`${weapon.missRate}%\`.\n` +
                    `The attack misses!`)
                    .setFooter({
                        iconURL: interaction.member.displayAvatarURL(),
                        text: `${interaction.member.displayName} tried to damage ${target.name}.`
                    });
                await interaction.reply({ embeds: [embed], ephemeral: false });
                return;
            }

            if (multiplier !== 1) {
                for (let i = 0; i < multiplier; i++) {
                    let temp = new DiceRoller(weapon.damage);
                    totalDamage += temp.getTotal();
                }
            }
            else {
                roller = new DiceRoller(weapon.damage);
                totalDamage = roller.getTotal();
            }

            if (target.game.resistances[weapon.damageType] > 0) {
                totalDamage = Math.floor(totalDamage - (totalDamage * (target.game.resistances[weapon.damageType] / 100)));
            }

            target.game.hp -= totalDamage;

            target.save();

            embed.setColor(VortoxColor.SUCCESS)
                .setDescription(`Rolling for ${weapon.name} accuracy...\n` +
                    `Rolled a \`${random}\`!\n` +
                    `${weapon.name}'s miss rate is \`${weapon.missRate}%\`.\n` +
                    `The attack hits for ${totalDamage} damage!\n` +
                    `${target.name} now has \`(${target.game.hp}/${target.game.maxHp})\` hp.`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} damaged ${target.name}.`
                });
        }
        else {
            const rollExpression = interaction.options.getString('expression');
            const damageType = interaction.options.getString('damage_type');

            try {
                roller = new DiceRoller(rollExpression);
            } catch (err) {
                if (err instanceof RollInitializeError) {
                    embed.setColor(VortoxColor.ERROR)
                        .setDescription(`Invalid dice syntax in expression \`${rollExpression}\`.`)
                        .setFooter({
                            iconURL: interaction.member.displayAvatarURL(),
                            text: `${interaction.member.displayName} tried to damage ${target.name}.`
                        });
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }
            }

            totalDamage = roller.getTotal();

            if (target.game.resistances[damageType] > 0) {
                totalDamage = Math.floor(totalDamage - (totalDamage * (target.game.resistances[damageType] / 100)));
            }

            target.game.hp -= totalDamage;

            target.save();

            embed.setColor(VortoxColor.SUCCESS)
                .setDescription(`Rolling \`${rollExpression}\`...\n` +
                    `${target.name} is hit for ${totalDamage} damage!\n` +
                    `${target.name} now has \`(${target.game.hp}/${target.game.maxHp})\` hp.`)
                .setFooter({
                    iconURL: interaction.member.displayAvatarURL(),
                    text: `${interaction.member.displayName} damaged ${target.name}.`
                });
        }

        await interaction.reply({ embeds: [embed] });
    },
};