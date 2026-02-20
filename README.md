# Farkle

Farkle is a Vue 3 application built with TypeScript. This project serves as a template for developing a modern web application using Vue.js and TypeScript.

## Project Structure

```
farkle
├── src
│   ├── main.ts               # Entry point of the application
│   ├── App.vue               # Root component
│   ├── components            # Contains reusable components
│   │   └── HelloWorld.vue    # Example component
│   ├── views                 # Contains view components
│   │   └── HomeView.vue      # Main view of the application
│   ├── router                # Vue Router configuration
│   │   └── index.ts          # Defines application routes
│   ├── store                 # Vuex store configuration
│   │   └── index.ts          # Manages application state
│   └── types                 # TypeScript types and interfaces
│       └── index.ts          # Type definitions
├── public
│   └── index.html            # Main HTML file
├── package.json              # NPM configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── README.md                 # Project documentation
```

## Getting Started

To get started with the Farkle project, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd farkle
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the development server:**
   ```
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to see your application in action.

## Features

- Vue 3 with Composition API
- TypeScript for type safety
- Vue Router for navigation
- Vuex for state management
- Vite for fast development and build process

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.