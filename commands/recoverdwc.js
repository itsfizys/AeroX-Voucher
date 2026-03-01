/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const config = require('../config.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dwcPath = path.join(__dirname, '../database/dwc.json');

function loadDatabase(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            return [];
        }
    }
    return [];
}

module.exports = {
    name: 'recoverdwc',
    description: 'Reloads the DWC list and sends logs in the same channel.',
    async execute(message) {
        if (message.author.id !== config.owners[0]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have permission to use this command.')
                ],
            });
        }

        const dwcDB = loadDatabase(dwcPath);

        if (dwcDB.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ No users found in the DWC database.')
                ],
            });
        }

        for (const [index, entry] of dwcDB.entries()) {
            message.channel.send(`${index + 1}. ${entry.username} : ${entry.userId} (${entry.reason})`);
        }
    },
};


/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
