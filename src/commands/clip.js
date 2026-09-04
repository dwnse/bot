import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createInfoEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { isAdmin } from '../utils/permissions.js';
import { obtenerMiembroPorDiscord } from '../services/vinculacion.js';
import { enviarClip, obtenerDestacados, obtenerPendientes, obtenerRecientes, moderarClip } from '../services/clips.js';
import { anunciarClipPendiente } from '../services/notificaciones.js';

const youtube = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,}/i;
const adminOnly = (interaction) => isAdmin(interaction) || interaction.options.getSubcommand() === 'enviar';

export default {
  data: new SlashCommandBuilder().setName('clip').setDescription('Clips del clan')
    .addSubcommand((s) => s.setName('enviar').setDescription('Envio para moderacion').addStringOption((o) => o.setName('url').setDescription('URL de YouTube').setRequired(true)).addStringOption((o) => o.setName('titulo').setDescription('Titulo').setRequired(true)).addStringOption((o) => o.setName('descripcion').setDescription('Descripcion')))
    .addSubcommand((s) => s.setName('recientes').setDescription('Ultimos clips'))
    .addSubcommand((s) => s.setName('destacados').setDescription('Clips destacados'))
    .addSubcommand((s) => s.setName('pendientes').setDescription('Clips pendientes de aprobacion'))
    .addSubcommand((s) => s.setName('aprobar').setDescription('Aprueba un clip').addIntegerOption((o) => o.setName('id').setDescription('ID').setRequired(true)))
    .addSubcommand((s) => s.setName('rechazar').setDescription('Rechaza un clip').addIntegerOption((o) => o.setName('id').setDescription('ID').setRequired(true)).addStringOption((o) => o.setName('motivo').setDescription('Motivo').setRequired(true))),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (['pendientes', 'aprobar', 'rechazar'].includes(subcommand) && !adminOnly(interaction)) return interaction.reply({ embeds: [createErrorEmbed('No tienes permisos de administrador.')], ephemeral: true });
    if (subcommand === 'pendientes') {
      const rows = await obtenerPendientes();
      return interaction.reply({ content: rows.map((clip) => `${clip.titulo} - ${clip.miembro?.nombre_usuario || clip.miembro?.nombre_mostrar || clip.autor || 'Sin autor'}\n${clip.youtube_url || clip.url}`).join('\n\n') || 'No hay clips pendientes.' });
    }
    if (['aprobar', 'rechazar'].includes(subcommand)) {
      await moderarClip(interaction.options.getInteger('id'), subcommand === 'aprobar' ? 'aprobado' : 'rechazado', interaction.user.id, interaction.options.getString('motivo'));
      return interaction.reply({ embeds: [createSuccessEmbed('Clip moderado', `El clip fue ${subcommand === 'aprobar' ? 'aprobado' : 'rechazado'}.`)] });
    }
    if (subcommand === 'enviar') {
      const url = interaction.options.getString('url');
      const member = await obtenerMiembroPorDiscord(interaction.user.id);
      if (!member) return interaction.reply({ embeds: [createErrorEmbed('Necesitas vincular tu cuenta primero.')], ephemeral: true });
      if (!youtube.test(url)) return interaction.reply({ embeds: [createErrorEmbed('La URL debe ser un enlace de YouTube valido.')], ephemeral: true });
      const clip = await enviarClip(member.id, url, interaction.options.getString('titulo'), interaction.options.getString('descripcion'));
      clip.miembro = member;
      await anunciarClipPendiente(interaction.client, clip);
      return interaction.reply({ embeds: [createSuccessEmbed('Clip enviado', 'Quedo pendiente de revision.')], ephemeral: true });
    }
    const rows = subcommand === 'destacados' ? await obtenerDestacados() : await obtenerRecientes();
    return interaction.reply({ embeds: [createInfoEmbed(subcommand === 'destacados' ? 'Clips destacados' : 'Clips recientes', rows.map((clip) => `**${clip.titulo}** - ${clip.youtube_url || clip.url}`).join('\n') || 'No hay clips.')] });
  },
};
