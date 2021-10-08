const { dbToken } = require('../config.json');
const Levels = require('discord-xp');

module.exports = (client) => {
    client.levelSetUp = async () => {
        Levels.setURL(dbToken);
    };
}