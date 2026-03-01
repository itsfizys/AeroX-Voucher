/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const config = require('../config.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'staffhelp',
    aliases: ['sh'],
    async execute(message, args) {
        try {
            if (!message.member.roles.cache.has(config.roles.staff)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('Access Denied!')
                            .setDescription('⚠️ You do not have the required role to use this command.'),
                    ],
                });
            }

            const helpEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('AeroX Voucher Staff Command Help')
                .setDescription('Welcome to the **Staff Command List**! Below are the commands you can use:')
                .addFields(
                    {
                        name: '**Management Commands**',
                        value: '`accept`, `deny`, `manual`, `mark`, `unmark`, `blacklist`, `unblacklist`, `staffnote`, `dwc`, `undwc`, `importvouches`, `removevouches`, `addbadge`, `removebadges`, `removeimported`, `delete (Deletes a vouch)`',
                    },
                    {
                        name: '**Information Commands**',
                        value: '`pending`, `pending <@user>`, `accepted <@user>`, `denied <@user>`, `vouchstats`, `mlist`, `staffstats`',
                    },
                    {
                        name: '**Vouch Commands**',
                        value: '`vouches`, `vouchinfo`, `manual`, `removevouches`, `manuals`', // Removed duplicate 'vouchinfo'
                    },
                    {
                        name: '**Developer Only**',
                        value: '`insertshiba`, `insertAeroX Voucher`, `gettoken`, `recoverdwc`, `recoverscammers`, `recoverimported`',
                    }
                )

                .setFooter({
                    text: config.branding.footer,
                })
                .setTimestamp()


            await message.reply({ embeds: [helpEmbed] });
        } catch (error) {
            console.error('Error in staffhelp command:', error);
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
