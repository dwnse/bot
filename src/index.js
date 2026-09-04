import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { config, assertConfig } from './config.js';
import { verificarActividad } from './services/activityFeed.js';
import { verificarEventosNuevos, verificarModeracion, verificarRecordatorios } from './services/notificaciones.js';

assertConfig();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
client.commands = new Collection();

const commandsPath = join(dirname(fileURLToPath(import.meta.url)), 'commands');
for (const file of (await readdir(commandsPath)).filter((name) => name.endsWith('.js'))) {
  const command = (await import(pathToFileURL(join(commandsPath, file)).href)).default;
  if (command?.data?.name && command.execute) client.commands.set(command.data.name, command);
}

const eventsPath = join(dirname(fileURLToPath(import.meta.url)), 'events');
for (const file of (await readdir(eventsPath)).filter((name) => name.endsWith('.js'))) {
  const event = (await import(pathToFileURL(join(eventsPath, file)).href)).default;
  if (!event?.name || !event.execute) continue;
  if (event.once) client.once(event.name, (...args) => event.execute(...args));
  else client.on(event.name, (...args) => event.execute(...args));
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Conectado como ${readyClient.user.tag}`);
  const poll = async () => {
    await Promise.allSettled([verificarActividad(readyClient), verificarEventosNuevos(readyClient), verificarModeracion(readyClient)]);
  };
  void poll();
  setInterval(poll, 2 * 60 * 1000);
  setInterval(() => verificarRecordatorios(readyClient).catch(console.error), 60 * 60 * 1000);
});

await client.login(config.discord.token);