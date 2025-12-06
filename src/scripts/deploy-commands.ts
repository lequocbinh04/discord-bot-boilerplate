/**
 * Deploy slash commands to Discord
 * Run with: pnpm deploy:commands
 *
 * Note: discordx automatically handles command registration on bot startup,
 * so this script is mainly for manual deployment or debugging.
 */

import 'reflect-metadata';
import { REST, Routes } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment variables');
  process.exit(1);
}

// Define commands manually for deployment
const commands = [
  {
    name: 'ping',
    description: 'Check bot latency',
  },
  {
    name: 'user',
    description: 'View user information and stats',
    options: [
      {
        name: 'target',
        description: 'User to view (defaults to yourself)',
        type: 6, // USER type
        required: false,
      },
    ],
  },
  {
    name: 'leaderboard',
    description: 'View the server XP leaderboard',
    options: [
      {
        name: 'limit',
        description: 'Number of users to show (default: 10, max: 25)',
        type: 4, // INTEGER type
        required: false,
        min_value: 1,
        max_value: 25,
      },
    ],
  },
];

async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`Deploying ${commands.length} slash commands...`);

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log('Successfully deployed slash commands globally!');
    console.log('Note: Global commands may take up to 1 hour to propagate.');
  } catch (error) {
    console.error('Failed to deploy commands:', error);
    process.exit(1);
  }
}

deployCommands();
