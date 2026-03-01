/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const config = require('../config.js');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'policy',
    async execute(message) {
        if (message.author.id !== config.owners[0]) {
            return;
        }

        const faqEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle(`${config.branding.name} Server & AeroX Voucher Vouch Bot Policies`)
            .setDescription(
                `Welcome to the official **${config.branding.name}** server! Below, you can find the policies related to our server and the **AeroX Voucher** vouch bot.`
            )


        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rpolicy')
                .setLabel('Report')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('vpolicy')
                .setLabel('Vouch')
                .setStyle(ButtonStyle.Primary)
        );


        await message.channel.send({ embeds: [faqEmbed], components: [buttons] });
    }
};

/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
