# Vata App - A Genealogy Desktop Application Built with AI

Vata is a modern genealogy application designed to help you manage and visualize family trees. The name "Vata" (वट - vaṭa) is inspired by the Sanskrit word for the banyan tree, which symbolizes family connections with its extensive root system and branches. This application was created primarily with AI assistance, showcasing the power of AI-driven development in building functional and user-friendly desktop applications.

## 🚧 Migration in Progress

This application is currently being migrated from a web-based Supabase architecture to a desktop application using Tauri. The previous web version is preserved in the [vata-app-supabase](https://github.com/vata-apps/vata-app-supabase) repository.

## 🌟 Features

- **Individuals**: Core module for managing family members with detailed profiles
- **Names**: Support for different name variations (birth, marriage, nickname) associated with individuals
- **Families**: Module for creating and visualizing relationships between individuals
- **Places**: Geographic location management with hierarchical relationships (city, county, state, country)
- **Events**: System for recording life events connected to individuals and families
- **Relationships**: Interconnections between all modules to create a comprehensive family tree
- **Offline-First**: Complete offline functionality with local SQLite database

## 🛠️ Technology Stack

This desktop application is built using modern technologies:

- **Desktop Framework**: Tauri for cross-platform desktop apps
- **Frontend**: React 19 with TypeScript
- **Routing**: TanStack Router for type-safe routing
- **Data Management**: TanStack Query for efficient data fetching and caching
- **Database**: SQLite with Drizzle ORM
- **UI Framework**: Mantine UI v8 with Tabler icons
- **Build Tool**: Vite for fast development and optimized builds

## 🤖 AI-Assisted Development

This project demonstrates the capabilities of AI-assisted development:

- **Code Generation**: Core application structure and components generated with AI assistance
- **Database Design**: Data models and relationships designed with AI guidance
- **UI/UX**: Interface components and layouts created with AI recommendations
- **Problem Solving**: Technical challenges addressed through AI collaboration

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- pnpm package manager
- Rust (for Tauri development)

### Development Setup

_Development setup instructions will be updated once the Tauri migration is complete._

For now, refer to the [Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites) for setting up the development environment.

## 📝 License

[MIT License](LICENSE)

## 🙏 Acknowledgements

- This project was built with the assistance of AI tools like Claude
- This README file was also created and refined with AI assistance
- UI components from Mantine
- Tabler icons for all iconography
- Tauri for cross-platform desktop framework
- Drizzle ORM for type-safe database operations
