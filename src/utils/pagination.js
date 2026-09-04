import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export const paginate = async (interaction, embeds, time = 60000) => {
  if (!embeds || embeds.length === 0) return;
  if (embeds.length === 1) {
    return interaction.reply({ embeds: [embeds[0]], ephemeral: false });
  }

  let currentPage = 0;

  const getRow = (page) => {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev_page')
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId('next_page')
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === embeds.length - 1)
    );
  };

  const message = await interaction.reply({
    embeds: [embeds[currentPage].setFooter({ text: `Página ${currentPage + 1}/${embeds.length}` })],
    components: [getRow(currentPage)],
    fetchReply: true
  });

  const collector = message.createMessageComponentCollector({
    filter: (i) => i.user.id === interaction.user.id,
    time: time,
    componentType: ComponentType.Button
  });

  collector.on('collect', async (i) => {
    if (i.customId === 'prev_page') {
      currentPage = Math.max(0, currentPage - 1);
    } else if (i.customId === 'next_page') {
      currentPage = Math.min(embeds.length - 1, currentPage + 1);
    }

    await i.update({
      embeds: [embeds[currentPage].setFooter({ text: `Página ${currentPage + 1}/${embeds.length}` })],
      components: [getRow(currentPage)]
    });
  });

  collector.on('end', async () => {
    try {
      await interaction.editReply({ components: [] });
    } catch (e) {
      // Message might have been deleted
    }
  });
};
