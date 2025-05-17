# CodeCircuit Spaced Repetition Flashcard App

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A modern, interactive flashcard application built with Nuxt 3 that uses spaced repetition algorithms to optimize your learning experience. Perfect for students, professionals, and lifelong learners.

<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg" width="100" height="100" alt="Logo" style="filter: invert(50%) sepia(50%) saturate(1000%) hue-rotate(200deg);">
</p>

## ✨ Features

- **Spaced Repetition Algorithm** - Cards are scheduled for review using proven spaced repetition techniques
- **Beautiful UI** - Modern, responsive design built with Tailwind CSS and shadcn/ui
- **Customizable Decks** - Create and manage flashcard decks on any topic
- **Detailed Statistics** - Track your learning progress with comprehensive charts and analytics
- **Mobile-friendly** - Study anywhere on any device

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PNPM (recommended) or NPM

### Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/yourusername/codecircuit-vch-spaced-repetition-flashcard.git
cd codecircuit-vch-spaced-repetition-flashcard

# Install dependencies
pnpm install
```

## 🖥️ Development

Start the development server on `http://localhost:3000`:

```bash
# Using pnpm (recommended)
pnpm dev

# Using npm
npm run dev
```

## 🏗️ Building for Production

Build the application for production:

```bash
# Using pnpm
pnpm build

# Using npm
npm run build
```

Locally preview production build:

```bash
# Using pnpm
pnpm preview

# Using npm
npm run preview
```

## 📚 Project Structure

```
├── assets/              # Static assets
├── components/          # Vue components
├── data/                # JSON data files for flashcards
├── layouts/             # App layouts
├── pages/               # Application pages
│   ├── index.vue        # Dashboard
│   ├── review.vue       # Flashcard review
│   ├── stats.vue        # Learning statistics
│   └── decks/           # Deck management
├── plugins/             # Nuxt plugins
├── public/              # Public static files
└── server/              # Server-side code
```

## 🛠️ Technologies Used

- [Nuxt 3](https://nuxt.com/) - Vue.js framework
- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component collection
- [ApexCharts](https://apexcharts.com/) - Modern charting library
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icons
- [dayjs](https://day.js.org/) - Date handling library

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
