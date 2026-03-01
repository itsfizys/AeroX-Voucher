/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const config = require('../config.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'leave',
    description: 'Leaves all servers with less than 10 members.',
    async execute(message) {
        const ownerId = config.owners[0];

        if (message.author.id !== ownerId) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('⚠️ You do not have permission to use this command.')]
            });
        }

        let leftCount = 0;

        for (const guild of message.client.guilds.cache.values()) {
            if (guild.memberCount < 10) {
                await guild.leave().catch(() => null);
                leftCount++;
            }
        }

        return message.reply({
            embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`✅ Successfully left **${leftCount}** servers with less than 10 members.`)]
        });
    },
};


/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
