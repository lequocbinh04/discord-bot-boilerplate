# Discord Bot Boilerplate

A scalable Discord bot boilerplate using **Clean Architecture**, **SOLID principles**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

## Tech Stack

| Category | Technology                |
| -------- | ------------------------- |
| Runtime  | Node.js 20+               |
| Language | TypeScript 5.x            |
| Discord  | discord.js v14 + discordx |
| DI       | TSyringe                  |
| ORM      | Prisma 5.x                |
| Database | PostgreSQL                |
| Logging  | Pino                      |
| Config   | Zod                       |
| Testing  | Vitest                    |

## Architecture

```
src/
├── domain/           # Core business logic (no external deps)
│   ├── entities/     # GuildEntity, UserEntity
│   ├── interfaces/   # IGuildRepository, IUserRepository
│   └── value-objects/# SnowflakeId
├── application/      # Business logic orchestration
│   ├── services/     # GuildService, UserService
│   └── errors/       # ApplicationError, NotFoundError
├── infrastructure/   # External concerns
│   ├── config/       # Zod-validated env config
│   ├── container/    # TSyringe DI setup
│   ├── database/     # Prisma + repositories
│   └── logging/      # Pino logger
└── presentation/     # Discord layer
    ├── commands/     # Slash commands
    ├── events/       # Discord events
    └── bot.ts        # Bot lifecycle
```

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/lequocbinh04/discord-bot-boilerplate
cd discord-bot-boilerplate
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DATABASE_URL=postgresql://user:pass@localhost:5432/discord_bot
NODE_ENV=development
LOG_LEVEL=debug
```

### 3. Setup Database

```bash
# Push schema to database
pnpm db:push

# Or create migration
pnpm db:migrate
```

### 4. Run the Bot

```bash
# Development (with hot reload)
pnpm dev

# Production
pnpm build
pnpm start
```

## Available Commands

| Command                | Description                 |
| ---------------------- | --------------------------- |
| `/ping`                | Check bot latency           |
| `/user [target]`       | View user profile and stats |
| `/leaderboard [limit]` | View server XP leaderboard  |

## Scripts

```bash
pnpm dev           # Run with hot reload
pnpm build         # Build for production
pnpm start         # Start production build
pnpm typecheck     # Check TypeScript types
pnpm lint          # Run ESLint
pnpm test          # Run tests
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema to DB
pnpm db:studio     # Open Prisma Studio
```

## Project Structure

### Domain Layer

- **Entities**: `GuildEntity`, `UserEntity` - business objects with validation
- **Value Objects**: `SnowflakeId` - typed Discord IDs
- **Interfaces**: Repository contracts (ports)

### Application Layer

- **Services**: `GuildService`, `UserService` - orchestrate domain logic
- **Errors**: Custom error classes

### Infrastructure Layer

- **Config**: Zod-validated environment variables
- **Container**: TSyringe dependency injection
- **Database**: Prisma repositories
- **Logging**: Pino structured logging

### Presentation Layer

- **Commands**: discordx slash commands
- **Events**: Discord event handlers
- **Bot**: Lifecycle management

## Adding New Commands

1. Create command file in `src/presentation/commands/`:

```typescript
import { Discord, Slash } from 'discordx';
import { injectable, inject } from 'tsyringe';
import { CommandInteraction } from 'discord.js';
import { TOKENS } from '@infrastructure/container/tokens.js';
import type { ILogger } from '@infrastructure/logging/index.js';

@Discord()
@injectable()
export class MyCommand {
  constructor(@inject(TOKENS.Logger) private logger: ILogger) {}

  @Slash({ name: 'mycommand', description: 'My custom command' })
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.reply('Hello!');
  }
}
```

2. Export from `src/presentation/commands/index.ts`

## Adding New Services

1. Define interface in `src/domain/interfaces/`
2. Create service in `src/application/services/`
3. Create repository in `src/infrastructure/database/repositories/`
4. Register in `src/infrastructure/container/container.ts`

## Environment Variables

| Variable            | Description                               | Required |
| ------------------- | ----------------------------------------- | -------- |
| `DISCORD_TOKEN`     | Bot token from Discord Developer Portal   | Yes      |
| `DISCORD_CLIENT_ID` | Application ID                            | Yes      |
| `DATABASE_URL`      | PostgreSQL connection string              | Yes      |
| `NODE_ENV`          | Environment (development/production/test) | No       |
| `LOG_LEVEL`         | Pino log level                            | No       |

## License

MIT
