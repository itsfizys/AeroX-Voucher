/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const config = require('../config.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'inv',
    aliases: ['invite'],
    async execute(message, args) {
        try {
            // Create the embed
            const helpEmbed = new EmbedBuilder()
                .setColor(0x5865F2)  // You can change the color as per preference
                .setTitle('AeroX Voucher Invites')
                .setDescription(`**Discord Invite**\n[Click Here](${config.branding.botInvite})\n**Server Invite**\n[Click Here](${config.branding.supportInvite})`)
                .setFooter({ text: config.branding.footer });

            // Create the buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Bot Invite')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.branding.botInvite),
                new ButtonBuilder()
                    .setLabel('Server Invite')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.branding.supportInvite)
            );

            // Send the embed with buttons as a reply
            await message.reply({ embeds: [helpEmbed], components: [row] });
        } catch (error) {
            console.error('Error in help command:', error);
            message.reply('There was an error while executing this command!');
        }
    },
};


/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
