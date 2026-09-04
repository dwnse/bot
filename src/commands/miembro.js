import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { isAdmin } from '../utils/permissions.js';
import { aprobarSolicitud, revisarSolicitud } from '../services/solicitudes.js';

export default {
  data: new SlashCommandBuilder().setName('miembro').setDescription('Aprueba o rechaza miembros')
    .addSubcommand((subcommand) => subcommand.setName('aceptar').setDescription('Acepta una solicitud').addStringOption((option) => option.setName('id').setDescription('ID de la solicitud').setRequired(true)))
    .addSubcommand((subcommand) => subcommand.setName('rechazar').setDescription('Rechaza una solicitud').addStringOption((option) => option.setName('id').setDescription('ID de la solicitud').setRequired(true)).addStringOption((option) => option.setName('motivo').setDescription('Motivo').setRequired(true))),
  async execute(interaction) {
    if (!isAdmin(interaction)) return interaction.reply({ embeds: [createErrorEmbed('No tienes permisos de administrador.')], ephemeral: true });
    const id = interaction.options.getString('id');
    if (interaction.options.getSubcommand() === 'aceptar') {
      const member = await aprobarSolicitud(id);
      return interaction.reply({ embeds: [createSuccessEmbed('Miembro aceptado', `**${member.nombre_usuario || member.nombre_mostrar}** ya forma parte del clan.`)] });
    }
    await revisarSolicitud(id, 'rechazada', null, interaction.options.getString('motivo'));
    return interaction.reply({ embeds: [createSuccessEmbed('Solicitud rechazada', 'La solicitud fue rechazada correctamente.')] });
  },
};