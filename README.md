# Vata App - A Genealogy Application Built with AI

Vata is a modern genealogy application designed to help you manage and visualize family trees. The name "Vata" (वट - vaṭa) is inspired by the Sanskrit word for the banyan tree, which symbolizes family connections with its extensive root system and branches. This application was created primarily with AI assistance, showcasing the power of AI-driven development in building functional and user-friendly web applications.

## 🌟 Features

- **Individuals**: Core module for managing family members with detailed profiles
- **Names**: Support for different name variations (birth, marriage, nickname) associated with individuals
- **Families**: Module for creating and visualizing relationships between individuals
- **Places**: Geographic location management with hierarchical relationships (city, county, state, country)
- **Events**: System for recording life events connected to individuals and families
- **Relationships**: Interconnections between all modules to create a comprehensive family tree
- **Sample Data**: Comes with pre-loaded seed data featuring a complete family tree to demonstrate functionality and provide a starting point

## 📚 Documentation

The project's documentation is available in the `/documentation` folder, which includes:

- **Database Schema**: Detailed information about tables, relationships, and security settings
- **Improvements**: Future plans, optimizations, and standardization guidelines
- **Best Practices**: Coding standards and project-specific guidelines
- **Decision Records**: Documentation of important technical decisions

For more details, see the [documentation README](/documentation/README.md).

## 🛠️ Technology Stack

This application is built using modern web technologies:

- **Frontend**: React 19 with TypeScript
- **Routing**: TanStack Router for type-safe routing
- **Data Management**: TanStack Query for efficient data fetching
- **Styling**: Tailwind CSS with Mantine components
- **Backend**: Supabase for database, authentication, and API
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
- Supabase account (for database)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/vata-app.git
   cd vata-app
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

### Database Setup

The application uses Supabase for database management:

```bash
# Reset the database to initial state
pnpm db:reset

# Generate TypeScript types from database schema
pnpm db:types
```

## 📝 License

[MIT License](LICENSE)

## 🙏 Acknowledgements

- This project was built with the assistance of AI tools like Claude
- This README file was also created and refined with AI assistance
- UI components from Mantine
- Supabase for backend infrastructure
