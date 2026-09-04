import { Events } from 'discord.js';
import { createErrorEmbed } from '../utils/embeds.js';
import { MessageFlags } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    if (interaction.isAutocomplete()) {
      try {
        if (command.autocomplete) {
          await command.autocomplete(interaction);
        }
      } catch (error) {
        console.error(error);
      }
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);

      const errorMessage = error.code === 'PUNTOS_RPC_MISSING'
        ? 'El comando de puntos necesita configurar la función autorizada de Supabase en SUPABASE_PUNTOS_RPC.'
        : error.code === 'P0001' && error.message?.toLowerCase().includes('permiso')
          ? 'Supabase rechazó la operación: la función requiere un usuario autenticado con el permiso puntos.asignar. El rol Admin de Discord no sustituye a auth.uid().' 
        : error.code === 'PGRST204'
        ? 'La base de datos no tiene una columna requerida por este comando. Revisa la migración del bot.'
        : error.code === '42501'
          ? 'La base de datos rechazó la operación por permisos (RLS). Configura SUPABASE_SERVICE_ROLE_KEY en el servidor.'
          : 'Hubo un error al ejecutar este comando. Inténtalo de nuevo más tarde.';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [createErrorEmbed(errorMessage)], flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ embeds: [createErrorEmbed(errorMessage)], flags: MessageFlags.Ephemeral });
      }
    }
  },
};
