const { SlashCommandBuilder } = require('@discordjs/builders');
const mongoose = require("mongoose");
const { characterSchema } = require("../../models/characters");
const { weaponSchema } = require("../../models/weapons");

const { DiceRoller} = require("vortox-dice-parser");
const { VortoxColor } = require('../../utilities/enums');
const { VortoxEmbed } = require("../../utilities/embeds");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('dmg')
        .setDescription('Damages a character. (Requires ongoing episode.)')
        .addSubcommand(subcommand =>
            subcommand.setName('weapon')
                .setDescription('Damages a character with the provided weapon.')
                .addStringOption(option =>
                    option.setName('target_id')
                        .setDescription('The target character\'s id. Required.')
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
                    option.setName('target_id')
                        .setDescription('The target character\'s id. Required.')
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
                            { name: 'Incorporeal', value: 'incorporeal' }
                        )
                )
        ),

    async execute(interaction) {
        const targetId = interaction.options.getString("target_id");
        const damage = interaction.options.getSubcommand();
        const Character = mongoose.model("Characters", characterSchema);

        let roller;
        let combatLog = "";
        let totalDamage = 0;
        let weaponName;
        let damageType;

        let target = await Character.findOne({ id: targetId });

        if (!target) {
            const embed = new VortoxEmbed(VortoxColor.ERROR, `Error Damaging \`${targetId}\``, "tried to damage someone.", interaction.member);
            embed.setDescription(`Character \`${targetId}\` does not exist!`)
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (damage === 'weapon') {
            const weaponId = interaction.options.getString("weapon_id");
            let multiplier = interaction.options.getInteger("multiplier");

            const Weapon = mongoose.model("Weapons", weaponSchema);
            const weapon = await Weapon.findOne({ id: weaponId });

            if (!weapon) {
                const embed = new VortoxEmbed(VortoxColor.ERROR, `Error Damaging ${target.name}`, `tried to damage ${target.name}.`, interaction.member);
                embed.setDescription(`Weapon \`${weaponId}\` does not exist!`)
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            weaponName = weapon.name;
            damageType = weapon.damageType;
            weapon.timesUsed++;
            await weapon.save();

            const random = Math.floor(Math.random() * 100) + 1;

            if (random <= weapon.missRate) {
                combatLog += `Rolling for ${weapon.name} accuracy...\n`;
                combatLog += `Rolled a \`${random}\`!\n${weapon.name}'s miss rate is \`${weapon.missRate}%\`.\n`;
                combatLog += `The attack misses!`;
                const embed = new VortoxEmbed(VortoxColor.MISS, `Attack Against ${target.name} Missed!`, `missed while attacking ${target.name}.`, interaction.member);
                embed.setDescription(combatLog);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            if (multiplier === null) multiplier = 1;

            for (let i = 0; i < multiplier; i++) {
                roller = new DiceRoller(weapon.damage)
                if (roller.getTotal() === roller.getMax()) {
                    combatLog += `Critical Hit! ${weapon.name} is rolled again!\n`
                    let temp = new DiceRoller(weapon.damage);
                    totalDamage += temp.getTotal();
                }
                if (roller.getTotal() === roller.getMin()) {
                    combatLog += `Critical Miss! ${weapon.name}'s damage is negated!\n`
                }
                else {
                    totalDamage += roller.getTotal();
                }
            }
        }
        else {
            const rollExpression = interaction.options.getString('expression');
            damageType = interaction.options.getString('damage_type');

            combatLog += `Rolling \`${rollExpression}\`...\n`;

            try {
                roller = new DiceRoller(rollExpression);
            } catch (error) {
                const embed = new VortoxEmbed(VortoxColor.ERROR, `Error Damaging ${target.name}`, `tried to damage ${target.name}.`, interaction.member);
                embed.setDescription(`Invalid dice syntax in expression \`${rollExpression}\`.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            totalDamage = roller.getTotal();
        }

        if (!target.incorporeal && damageType !== 'incorporeal' && totalDamage >= 0) {
            combatLog += `${target.name} is \`incorporeal\`!\n${weaponName} misses, dealing no damage to ${target.name}.`
            const ghostEmbed = new VortoxEmbed(VortoxColor.MISS, `Damaging ${target.name}`, `tried to damage ${target.name}.`, interaction.member);
            ghostEmbed.setDescription(combatLog);
            await interaction.reply( { embeds: [ghostEmbed] });
            return;
        }

        const successEmbed = new VortoxEmbed(VortoxColor.SUCCESS, `Damaging ${target.name}`, `damaged ${target.name}.`, interaction.member)

        if (totalDamage > 0)
            combatLog += `${weaponName} hits for \`${totalDamage}\` damage!\n`;
        else if (totalDamage < 0) {
            successEmbed.setTitle(`Healing ${target.name}`).setFooter(`healed ${target.name}.`);
            combatLog += `${target.name} is healed for \`${Math.abs(totalDamage)}\` damage!\n`;
        }
        else {
            const missEmbed = new VortoxEmbed(VortoxColor.MISS, `Damaging ${target.name}`, `missed while attacking ${target.name}.`, interaction.member);
            combatLog += `${weaponName} misses, dealing no damage to ${target.name}.`;
            missEmbed.setDescription(combatLog);
            await interaction.reply({ embeds: [missEmbed] });
            return;
        }

        if (target.game.resistances[damageType] > 0 && totalDamage > 0) {
            totalDamage = Math.ceil(totalDamage - (totalDamage * (target.game.resistances[damageType] / 100)));
            combatLog += `${target.name} has a \`${target.game.resistances[damageType]}%\` \`${damageType}\` resistance!\n`;
        }

        if (target.game.shield > 0) {
            if (totalDamage > target.game.shield) {
                combatLog += `${target.name}'s shield took \`${target.game.shield}\` damage and broke.\n`;
                totalDamage -= target.game.shield;
                target.game.shield = 0;
                combatLog += `${target.name} takes \`${totalDamage}\` damage!\n`
                target.game.hp -= totalDamage;
            }
            else {
                combatLog += `${target.name}'s shield took \`${target.game.shield - totalDamage}\` damage, saving them.\n`;
                combatLog += `${target.name}'s shield has \`${target.game.shield - totalDamage}/${target.game.shield}\` health.\n`
                target.game.shield -= totalDamage;
            }
        }
        else {
            combatLog += `${target.name} takes \`${totalDamage}\` damage.\n`;
            target.game.hp -= totalDamage;
        }

        await target.save();

        combatLog += `${target.name} has \`(${target.game.hp}/${target.game.maxHp})\` hp.`;
        successEmbed.setDescription(combatLog);

        await interaction.reply({ embeds: [successEmbed] });
    }
};