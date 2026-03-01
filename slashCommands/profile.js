/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const config = require('../config.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const vouchesPath = path.join(__dirname, '../database/vouches.json');
const profilePath = path.join(__dirname, '../database/profile.json');
const blacklistedPath = path.join(__dirname, '../database/blacklisted.json');
const dwcPath = path.join(__dirname, '../database/dwc.json');
const scammersPath = path.join(__dirname, '../database/scammers.json');
const gifPath = path.join(__dirname, '../database/gif.json');
const badgesPath = path.join(__dirname, '../database/badges.json');
const importedPath = path.join(__dirname, '../database/imported.json');

function loadDatabase(dbPath) {
    if (fs.existsSync(dbPath)) {
        try {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (error) {
            console.error(`Error loading database (${dbPath}):`, error);
            return {};
        }
    }
    return {};
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Shows the user profile including vouch info, comments, and additional details.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to show the profile for')
                .setRequired(false)
        ),
    async execute(interaction) {
        console.log('Command execution started.');

        const user = interaction.options.getUser('user') || interaction.user;

        console.log(`Fetching profile for: ${user.tag}`);

        const vouchesDB = loadDatabase(vouchesPath);
        const profileDB = loadDatabase(profilePath);
        const blacklistedDB = loadDatabase(blacklistedPath);
        const dwcDB = loadDatabase(dwcPath);
        const scammersDB = loadDatabase(scammersPath);
        const gifDB = loadDatabase(gifPath);
        const badgesDB = loadDatabase(badgesPath);
        const importedDB = loadDatabase(importedPath);

        const scammerEntry = scammersDB.find((entry) => entry.userId === user.id);
        if (scammerEntry) {
            console.log(`User ${user.tag} is marked as a scammer.`);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle(`${user.tag} is a Scammer!`)
                        .setDescription(
                            `**MARKED BY STAFF**\n\n**This User Was Marked For:** ${scammerEntry.reason}`
                        )
                        .setFooter({ text: config.branding.footer }),
                ],
                ephemeral: false,
            });
        }

        if (blacklistedDB.includes(user.id)) {
            console.log(`User ${user.tag} is blacklisted.`);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle(`${user.tag} is Blacklisted!`)
                        .setDescription(
                            `*Marked By Staff*\nTo Appeal: [Join](${config.branding.supportInvite})`
                        ),
                ],
                ephemeral: false,
            });
        }

        const dwcEntry = dwcDB.find((entry) => entry.userId === user.id);
        if (dwcEntry) {
            console.log(`User ${user.tag} has a DWC entry.`);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `${user.tag}'s Profile`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                        .setColor(0xff0000)
                        .setDescription(
                            `⚠️ **__DEAL WITH CAUTION__** ⚠️\n\n` +
                            `**Reason:** ${dwcEntry.reason}\n` +
                            `**ID:** ${user.id}\n` +
                            `**Registration Date:** <t:${Math.floor(user.createdTimestamp / 1000)}:D>\n` +
                            `**Display Name:** ${user.username}\n**Mention:** <@${user.id}>\n\n` +
                            `Feel free to appeal this at [Support](${config.branding.supportInvite})`
                        )
                        .setFooter({ text: config.branding.footer }),
                ],
                ephemeral: false,
            });
        }

        const vouchInfo = await getVouchInfo(user.id, vouchesDB);
        const pastComments = await getPastComments(user.id, vouchesDB);

        const userProfile = profileDB[user.id] || {};
        const discordLink = userProfile.discord || 'Not set';
        const forumInfo = userProfile.forum || 'Not set';
        const productsInfo = userProfile.products || 'Not set';
        const embedColor = userProfile.color || '#2b2d30';

        const gifUrl = gifDB[user.id] ? gifDB[user.id].url : null;

        let badges = [];
        const importedVouches = importedDB[user.id] || 0;

        let overallVouches = vouchInfo.positiveCount + importedVouches;

        if (overallVouches >= 500) {
            badges.push(`${config.badges.v500} 500+ Vouches`);
        } else if (overallVouches >= 250) {
            badges.push(`${config.badges.v250} 250+ Vouches`);
        } else if (overallVouches >= 100) {
            badges.push(`${config.badges.v100} 100+ Vouches`);
        } else if (overallVouches >= 50) {
            badges.push(`${config.badges.v50} 50+ Vouches`);
        }

        const topVouchesList = vouchesDB
            .filter((v) => v.status === 'accepted')
            .reduce((acc, v) => {
                acc[v.recipientId] = (acc[v.recipientId] || 0) + 1;
                return acc;
            }, {});

        const sortedVouchCounts = Object.entries(topVouchesList)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        if (sortedVouchCounts.some(([userId]) => userId === user.id)) {
            badges.push(`${config.badges.top10} Top-10 Vouches`);
        }

        const guildId = config.branding.supportServerId;
        const guild = interaction.client.guilds.cache.get(guildId);

        if (guild) {
            const member = guild.members.cache.get(user.id);
            if (member) {
                badges.push(`${config.badges.member} Member`);
                if (member.premiumSince) {
                    badges.push(`${config.badges.booster} Booster`);
                }
            }
        }

        if (badgesDB[user.id]) {
            badges = [...badges, ...badgesDB[user.id]];
        }

        const profileEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`${user.tag}'s Profile`)
            .setDescription(
                `**ID:** ${user.id}\n**Registration Date:** <t:${Math.floor(
                    user.createdTimestamp / 1000
                )}:D>\n**Display Name:** ${user.username}\n**Mention:** <@${user.id}>\n` +
                `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
                `**__Vouch Information__**\n` +
                `**Positive:** ${vouchInfo.positiveCount}\n**Negative:** 0\n` +
                `**Imported:** ${importedVouches}\n**Overall:** ${overallVouches}\n\n` +
                `**__Badges__**\n` +
                (badges.length ? badges.join('\n') : 'No badges yet') +
                `\n\n**__Services and Products__**\n` +
                `**Discord:** ${discordLink}\n**Forum:** ${forumInfo}\n**Products:** ${productsInfo}\n` +
                `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
                `**__Past 5 Comments__**\n` +
                (pastComments.length
                    ? pastComments
                        .map((comment, index) => `**${index + 1})** ${comment}`)
                        .join('\n')
                    : 'No comments available')
            )
            .setFooter({ text: config.branding.footer })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }));

        if (gifUrl) {
            profileEmbed.setImage(gifUrl);
        }

        try {
            const sentMessage = await interaction.reply({ embeds: [profileEmbed], ephemeral: false });
            setTimeout(() => {
                sentMessage.delete().catch(err => console.error('Failed to delete the profile message:', err));
            }, 15000);
        } catch (err) {
            console.error('Error sending the profile message:', err);
        }
    },
};

async function getVouchInfo(userId, vouchesDB) {
    const positiveCount = vouchesDB.filter(
        (v) => v.recipientId === userId && v.status === 'accepted'
    ).length;

    return { positiveCount };
}

async function getPastComments(userId, vouchesDB) {
    const comments = vouchesDB
        .filter((v) => v.recipientId === userId && v.status === 'accepted')
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)
        .map((v) => v.dealDetails);

    return comments;
}


/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
