import 'dotenv/config';

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.GUILD_ID,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    puntosRpc: process.env.SUPABASE_PUNTOS_RPC || null,
  },
  channels: {
    anuncios: process.env.CHANNEL_ANUNCIOS || null,
    actividad: process.env.CHANNEL_ACTIVIDAD || null,
    moderacion: process.env.CHANNEL_MODERACION || null,
    bienvenida: process.env.CHANNEL_BIENVENIDA || null,
  },
  roles: {
    admin: process.env.ROL_ADMIN || 'Admin',
  },
};

export const assertConfig = (forDeployment = false) => {
  const required = forDeployment
    ? ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'GUILD_ID']
    : ['DISCORD_TOKEN', 'SUPABASE_URL', 'SUPABASE_KEY'];
  const missing = required.filter((name) => !process.env[name] || process.env[name].includes('AQUI'));
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
};
