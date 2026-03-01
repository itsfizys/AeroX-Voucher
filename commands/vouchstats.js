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
const moment = require('moment-timezone');

function loadDatabase() {
    try {
        const data = fs.readFileSync(path.join(__dirname, '../database/vouches.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading vouches database:', error);
        return null;
    }
}

module.exports = {
    name: 'vouchstats',
    aliases: ['vstats'],
    async execute(message) {
        if (!message.member.roles.cache.has(config.roles.statsAccess) && !message.member.roles.cache.has(config.roles.staff)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role.'),
                ],
            });
        }

        const vouches = loadDatabase();
        if (!vouches) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Failed to load vouch data. Please try again later.')
                ],
            });
        }

        // Get timestamps for different periods in GMT+5:30
        const now = moment().tz('Asia/Kolkata');
        const startOfDay = now.clone().startOf('day').valueOf();
        const startOfYesterday = now.clone().subtract(1, 'days').startOf('day').valueOf();
        const startOfWeek = now.clone().subtract(6, 'days').startOf('day').valueOf();
        const startOfMonth = now.clone().startOf('month').valueOf();

        // Count vouches within each time period
        const totalVouchesToday = vouches.filter(v => v.timestamp >= startOfDay).length;
        const totalVouchesYesterday = vouches.filter(v => v.timestamp >= startOfYesterday && v.timestamp < startOfDay).length;
        const totalVouchesWeek = vouches.filter(v => v.timestamp >= startOfWeek).length;
        const totalVouchesMonth = vouches.filter(v => v.timestamp >= startOfMonth).length;
        const totalVouchesLifetime = vouches.length;

        // Count vouches by status
        const pendingVouches = vouches.filter(v => v.status === 'pending').length;
        const acceptedVouches = vouches.filter(v => v.status === 'accepted').length;
        const deniedVouches = vouches.filter(v => v.status === 'denied').length;
        const manualVouches = vouches.filter(v => v.status === 'manual').length;

        const statsEmbed = new EmbedBuilder()
            .setColor(0x00ffb3)
            .setTitle('AeroX Voucher Statistics')
            .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🌟 **__Vouches Stats__**', value: `\u200B`, inline: false },
                { name: 'Today', value: `**${totalVouchesToday}**`, inline: true },
                { name: 'Yesterday', value: `**${totalVouchesYesterday}**`, inline: true },
                { name: 'Last 7 Days', value: `**${totalVouchesWeek}**`, inline: true },
                { name: 'Lifetime', value: `**${totalVouchesLifetime}**`, inline: true },
                { name: '\u200B', value: '\u200B', inline: false },
                { name: 'Accepted Vouches', value: `**${acceptedVouches}**`, inline: true },
                { name: 'Denied Vouches', value: `**${deniedVouches}**`, inline: true },
                { name: 'Pending Vouches', value: `**${pendingVouches}**`, inline: true },
                { name: 'Manual Vouches', value: `**${manualVouches}**`, inline: true }
            )
            .setFooter({ text: 'AeroX Voucher Stats', iconURL: message.client.user.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [statsEmbed] });
    },
};


/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
