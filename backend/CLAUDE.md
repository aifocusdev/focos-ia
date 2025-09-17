# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS TypeScript API project using pnpm as the package manager. The application follows standard NestJS architecture with modules, controllers, and services.

## Common Development Commands

### Package Management
```bash
pnpm install                    # Install dependencies
```

### Development
```bash
pnpm run start:dev             # Start development server with watch mode
pnpm run start                 # Start development server
pnpm run start:debug           # Start with debug mode and watch
pnpm run start:prod            # Start production server
```

### Building
```bash
pnpm run build                 # Build the application using NestJS CLI
```

### Code Quality
```bash
pnpm run lint                  # Run ESLint with auto-fix
pnpm run format                # Format code with Prettier
```

### Testing
```bash
pnpm run test                  # Run unit tests
pnpm run test:watch            # Run tests in watch mode
pnpm run test:cov              # Run tests with coverage
pnpm run test:e2e              # Run end-to-end tests
pnpm run test:debug            # Debug tests with Node inspector
```

## Architecture

- **Framework**: NestJS with TypeScript
- **Entry Point**: `src/main.ts` - Bootstrap application on port 3000 (or PORT env var)
- **Root Module**: `src/app.module.ts` - Main application module
- **Structure**: Standard NestJS structure with controllers, services, and modules
- **Build Output**: `dist/` directory
- **TypeScript**: ES2023 target with decorators enabled

## Configuration

- **Package Manager**: pnpm (uses pnpm-lock.yaml)
- **Test Framework**: Jest with ts-jest transformer
- **Linting**: ESLint with TypeScript and Prettier integration
- **TypeScript**: Strict null checks enabled, but no implicit any disabled for flexibility