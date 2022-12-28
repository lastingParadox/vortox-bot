const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require("discord.js");

function characterGeneralModal(id, name, hp, description) {
    const modal = new ModalBuilder().setCustomId('character_general').setTitle('Editing General Character');

    const idInput = new TextInputBuilder().setCustomId('character_id')
        .setLabel('Character ID')
        .setPlaceholder('ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    if (id) idInput.setValue(id);

    const nameInput = new TextInputBuilder().setCustomId('character_name')
        .setLabel('Character Name')
        .setPlaceholder('Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    if (name) nameInput.setValue(name);

    const hpInput = new TextInputBuilder().setCustomId('character_hp')
        .setLabel('Character HP')
        .setPlaceholder('20')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    if (hp) hpInput.setValue(hp);

    const descInput = new TextInputBuilder().setCustomId('character_desc')
        .setLabel('Character Description')
        .setPlaceholder('Character description here.')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
    if (description) descInput.setValue(description);

    const firstActionRow = new ActionRowBuilder().addComponents(idInput);
    const secondActionRow = new ActionRowBuilder().addComponents(nameInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(hpInput);
    const fourthActionRow = new ActionRowBuilder().addComponents(descInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

    return modal;
}