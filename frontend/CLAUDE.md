# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript frontend application using Vite as the build tool. The project is designed to work as the frontend interface for the ApiCeChat API system, providing a modern chat/CRM interface with real-time capabilities.

## Common Development Commands

### Development
```bash
npm run dev                     # Start development server with HMR on http://localhost:5173
npm run preview                 # Preview production build locally
```

### Building
```bash
npm run build                   # TypeScript compile check + Vite production build
```

### Code Quality
```bash
npm run lint                    # Run ESLint with auto-fix
```

## Architecture & Technology Stack

### Core Technologies
- **React 19** with TypeScript for UI components
- **Vite** for fast development and building
- **TailwindCSS** for styling with @tailwindcss/forms
- **React Router DOM** for client-side routing
- **Zustand** for state management (lightweight alternative to Redux)

### Key Libraries
- **Socket.io Client** for real-time WebSocket communication with the API
- **Axios** for HTTP requests to the backend API
- **React Hook Form + Yup** for form handling and validation
- **Headless UI + Heroicons** for accessible UI components
- **Lucide React** for additional icons
- **date-fns** for date manipulation
- **class-variance-authority (CVA) + clsx** for conditional CSS classes

### Project Structure
- **Entry Point**: `src/main.tsx` - React application bootstrap
- **Root Component**: `src/App.tsx` - Main application component
- **TypeScript Config**: Project uses composite TypeScript configuration with separate configs for app and build tools
- **Build Output**: `dist/` directory

## API Integration Context

This frontend is designed to work with the companion NestJS API located at `/Users/ph/Desktop/mine/apicechat-api` which provides:
- JWT authentication system
- Real-time WebSocket connections for chat
- WhatsApp Business API integration
- Contact and conversation management
- File upload capabilities via Supabase

### Expected Integration Points
- **Authentication**: JWT-based auth flow with the API
- **Real-time Chat**: Socket.io connection for live messaging
- **API Endpoints**: RESTful API for CRUD operations on conversations, contacts, messages
- **File Handling**: Integration with backend's Supabase storage for media attachments

## Development Notes

### TypeScript Configuration
- Uses modern ES2022 target with strict type checking
- Configured for bundler module resolution (Vite)
- Strict linting rules enabled (noUnusedLocals, noUnusedParameters)

### State Management Strategy
- Zustand is chosen over Redux for simpler state management
- Ideal for managing authentication state, active conversations, and UI state

### Real-time Architecture
- Socket.io client configured for WebSocket communication
- Should handle conversation updates, new messages, and user presence

### Form Handling
- React Hook Form with Yup validation for type-safe forms
- Particularly important for contact creation, message composition, and settings

## Build & Deploy
- Production builds are optimized and tree-shaken via Vite
- TypeScript compilation occurs before Vite build process
- Static assets are handled through Vite's asset pipeline