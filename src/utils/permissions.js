import { config } from '../config.js';
import { supabase } from '../supabase.js';

export const isAdmin = (interaction) => {
  if (!interaction.member) return false;
  
  // Check if member has the admin role by name or if they have Administrator permission
  const hasAdminRole = interaction.member.roles.cache.some(role => role.name === config.roles.admin);
  const hasAdminPermission = interaction.member.permissions.has('Administrator');
  
  return hasAdminRole || hasAdminPermission;
};

export const getMiembro = async (discordId) => {
  const { data, error } = await supabase
    .from('miembros')
    .select('*, tier:tiers(*)')
    .eq('discord_id', discordId)
    .single();
    
  if (error || !data) return null;
  return data;
};

export const requireVinculacion = async (interaction) => {
  const miembro = await getMiembro(interaction.user.id);
  
  if (!miembro) {
    await interaction.reply({
      content: '❌ Necesitas vincular tu cuenta primero. Usa `/vincular cuenta <nombre_usuario>`.',
      ephemeral: true
    });
    return null;
  }
  
  return miembro;
};
