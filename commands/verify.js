/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const config = require('../config.js');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'verify',
    async execute(message) {
        const requiredGuildId = config.branding.supportServerId;


        if (message.guild.id !== requiredGuildId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ This command can only be used in the support server.'),
                ],
            });
        }


        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You need the **Manage Guild** permission to use this command.'),
                ],
            });
        }


        const verificationEmbed = new EmbedBuilder()
            .setColor(0x2b2d30)
            .setAuthor({
                name: 'AeroX Voucher',
                iconURL: message.guild.iconURL({ dynamic: true }),
            })
            .setTitle('Verification')
            .setDescription('Click the button below to get verified.')
            .setFooter({ text: config.branding.footer })
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setImage(config.images.verificationGif)



        const verifyButton = new ButtonBuilder()
            .setCustomId('verify')
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success);

        const actionRow = new ActionRowBuilder().addComponents(verifyButton);

        message.channel.send({
            embeds: [verificationEmbed],
            components: [actionRow],
        });
    },
};


/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
