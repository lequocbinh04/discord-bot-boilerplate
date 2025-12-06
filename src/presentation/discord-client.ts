import { dirname, importx } from '@discordx/importer';
import { IntentsBitField } from 'discord.js';
import { Client, DIService, tsyringeDependencyRegistryEngine } from 'discordx';
import { container } from 'tsyringe';

// Configure discordx to use TSyringe
DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

export function createDiscordClient(): Client {
  return new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],
    silent: false,
  });
}

export async function loadDiscordComponents(): Promise<void> {
  // Import all commands and events
  await importx(
    `${dirname(import.meta.url)}/commands/**/*.{ts,js}`,
    `${dirname(import.meta.url)}/events/**/*.{ts,js}`
  );
}
