/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearmydms')
        .setDescription('Deletes all messages the bot has sent to you in DMs'),

    async execute(interaction) {
        await interaction.reply({ content: 'This command has been temporarily disabled.', ephemeral: true });
    },
};




/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
