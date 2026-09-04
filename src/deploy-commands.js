import { REST, Routes } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { config, assertConfig } from './config.js';

assertConfig(true);
const commandsPath = join(dirname(fileURLToPath(import.meta.url)), 'commands');
const commands = [];
for (const file of (await readdir(commandsPath)).filter((name) => name.endsWith('.js'))) {
  const command = (await import(pathToFileURL(join(commandsPath, file)).href)).default;
  if (command?.data) commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.discord.token);
await rest.put(Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId), { body: commands });
console.log(`Registrados ${commands.length} comandos en el servidor ${config.discord.guildId}.`);