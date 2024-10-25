module.exports = {
    data: {
      customId: "remove",
    },
    execute: async (client, interaction) => {
        const queue = client.distube.getQueue(interaction);
        const oldNotifications = await queue.textChannel.messages.fetch({
            limit: 1,
          });
          oldNotifications.forEach(async (message) => {
            await message.delete().catch(console.error);
          });
    }
}