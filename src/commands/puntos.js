import { SlashCommandBuilder } from 'discord.js';
import { createErrorEmbed, createInfoEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { isAdmin } from '../utils/permissions.js';
import { obtenerMiembroPorDiscord } from '../services/vinculacion.js';
import { cambiarPuntos, obtenerCategorias, obtenerHistorial, obtenerRanking } from '../services/puntos.js';

const command = new SlashCommandBuilder().setName('puntos').setDescription('Consulta y administra puntos')
	.addSubcommand((subcommand) => subcommand.setName('ranking').setDescription('Top 20'))
	.addSubcommand((subcommand) => subcommand.setName('ver').setDescription('Ver puntos').addUserOption((option) => option.setName('usuario').setDescription('Usuario')))
	.addSubcommand((subcommand) => subcommand.setName('historial').setDescription('Ver movimientos').addUserOption((option) => option.setName('usuario').setDescription('Usuario')))
	.addSubcommand((subcommand) => subcommand.setName('dar').setDescription('Otorga puntos').addUserOption((option) => option.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption((option) => option.setName('cantidad').setDescription('Cantidad').setRequired(true).setMinValue(1)).addStringOption((option) => option.setName('categoria').setDescription('Categoria').setRequired(true).setAutocomplete(true)).addStringOption((option) => option.setName('motivo').setDescription('Motivo').setRequired(true)))
	.addSubcommand((subcommand) => subcommand.setName('quitar').setDescription('Quita puntos').addUserOption((option) => option.setName('usuario').setDescription('Usuario').setRequired(true)).addIntegerOption((option) => option.setName('cantidad').setDescription('Cantidad').setRequired(true).setMinValue(1)).addStringOption((option) => option.setName('categoria').setDescription('Categoria').setRequired(true).setAutocomplete(true)).addStringOption((option) => option.setName('motivo').setDescription('Motivo').setRequired(true)));

export default {
	data: command,
	async autocomplete(interaction) {
		const values = await obtenerCategorias(interaction.options.getString('categoria') || '');
		return interaction.respond(values.map((category) => ({ name: category.nombre, value: category.nombre })));
	},
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		if (['dar', 'quitar'].includes(subcommand)) {
			if (!isAdmin(interaction)) return interaction.reply({ embeds: [createErrorEmbed('No tienes permisos de administrador.')], ephemeral: true });
			const miembro = await obtenerMiembroPorDiscord(interaction.options.getUser('usuario').id);
			const categories = await obtenerCategorias(interaction.options.getString('categoria'));
			const category = categories.find((item) => item.nombre.toLowerCase() === interaction.options.getString('categoria').toLowerCase());
			if (!miembro || !category) return interaction.reply({ embeds: [createErrorEmbed('Miembro o categoria no encontrados.')], ephemeral: true });
			const amount = interaction.options.getInteger('cantidad') * (subcommand === 'dar' ? 1 : -1);
			await cambiarPuntos(miembro.id, category.id, amount, interaction.options.getString('motivo'));
			return interaction.reply({ embeds: [createSuccessEmbed('Puntos actualizados', `Se actualizaron los puntos de **${miembro.nombre_mostrar || miembro.nombre_usuario}**.`)] });
		}
		if (subcommand === 'ranking') {
			const rows = await obtenerRanking();
			return interaction.reply({ embeds: [createInfoEmbed('Ranking de puntos', rows.map((member, index) => `**${index + 1}.** ${member.nombre_mostrar || member.nombre_usuario} - ${member.puntos_totales || 0} pts`).join('\n') || 'Sin miembros')] });
		}
		const member = await obtenerMiembroPorDiscord((interaction.options.getUser('usuario') || interaction.user).id);
		if (!member) return interaction.reply({ embeds: [createErrorEmbed('Usuario no vinculado.')], ephemeral: true });
		const history = await obtenerHistorial(member.id);
		return interaction.reply({ embeds: [createInfoEmbed('Historial de puntos', history.map((movement) => `${movement.cantidad > 0 ? '+' : ''}${movement.cantidad} - ${movement.categoria?.nombre || 'Categoria'} - ${movement.motivo}`).join('\n') || 'Sin movimientos')] });
	},
};