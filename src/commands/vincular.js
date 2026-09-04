import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed, createInfoEmbed } from '../utils/embeds.js';
import { isAdmin } from '../utils/permissions.js';
import { desvincularCuenta, obtenerMiembroPorDiscord, vincularCuenta } from '../services/vinculacion.js';

export default {
  data: new SlashCommandBuilder()
    .setName('vincular').setDescription('Vincula tu cuenta del clan')
    .addSubcommand((sub) => sub.setName('cuenta').setDescription('Vincula tu nombre de usuario').addStringOption((option) => option.setName('nombre_usuario').setDescription('Usuario de la web').setRequired(true)))
    .addSubcommand((sub) => sub.setName('estado').setDescription('Consulta tu vinculación'))
    .addSubcommand((sub) => sub.setName('desvincular').setDescription('Elimina tu vinculación'))
    .addSubcommand((sub) => sub.setName('forzar').setDescription('Vincula la cuenta de otro usuario').addUserOption((option) => option.setName('usuario').setDescription('Usuario de Discord').setRequired(true)).addStringOption((option) => option.setName('nombre_usuario').setDescription('Usuario de la web').setRequired(true))),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'estado') {
      const miembro = await obtenerMiembroPorDiscord(interaction.user.id);
      return interaction.reply({ embeds: [miembro ? createInfoEmbed('Cuenta vinculada', `Tu cuenta es **${miembro.nombre_usuario}**.`) : createErrorEmbed('No tienes una cuenta vinculada.')], ephemeral: true });
    }
    if (subcommand === 'desvincular') {
      const miembro = await desvincularCuenta(interaction.user.id);
      return interaction.reply({ embeds: [miembro ? createSuccessEmbed('Cuenta desvinculada', 'Tu cuenta de Discord ya no está vinculada.') : createErrorEmbed('No tienes una cuenta vinculada.')], ephemeral: true });
    }
    if (subcommand === 'forzar' && !isAdmin(interaction)) return interaction.reply({ embeds: [createErrorEmbed('No tienes permisos de administrador.')], ephemeral: true });
    const discordUser = subcommand === 'forzar' ? interaction.options.getUser('usuario') : interaction.user;
    const result = await vincularCuenta(discordUser.id, interaction.options.getString('nombre_usuario'));
    if (result.error === 'not_found') return interaction.reply({ embeds: [createErrorEmbed('No existe un miembro con ese nombre de usuario.')], ephemeral: true });
    if (result.error === 'already_linked') return interaction.reply({ embeds: [createErrorEmbed('Ese miembro ya está vinculado a otra cuenta.')], ephemeral: true });
    return interaction.reply({ embeds: [createSuccessEmbed('Cuenta vinculada', `**${discordUser.username}** está vinculado a **${result.miembro.nombre_usuario}**.`)], ephemeral: true });
  },
};