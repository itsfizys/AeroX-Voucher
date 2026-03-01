/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Get the bot latency and API latency.',
  async execute(message) {
    const botLatency = Date.now() - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);
      
    const resultEmbed = new EmbedBuilder()
      .setColor(0x5865F2) 
      .setDescription(
        `**Bot Latency:** \`${botLatency}ms\`\n` +
        `**API Latency:** \`${apiLatency}ms\``
      )
      .setTimestamp();

    await message.channel.send({ embeds: [resultEmbed] });
  },
};


/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
