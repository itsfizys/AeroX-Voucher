/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const config = require('../config.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'report',
    async execute(message) {
        const reportEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('How do I report someone?')
            .setDescription(`Head over to [our server](${config.branding.supportInvite}) to report a user!`)
            .setFooter({ text: config.branding.footer });

        message.reply({ embeds: [reportEmbed] });
    },
};


/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
