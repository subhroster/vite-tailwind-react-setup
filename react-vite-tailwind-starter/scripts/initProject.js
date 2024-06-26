#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function createReactViteTailwindApp(projectName) {
  if (!projectName) {
    console.log("Please specify a project name.");
    process.exit(1);
  }

  console.log(`Creating a new React project with Vite: ${projectName}`);
  execSync(`npm create vite@latest ${projectName} -- --template react`, {
    stdio: "inherit",
  });

  process.chdir(projectName);
  console.log("Installing Tailwind CSS...");
  execSync("npm install -D tailwindcss postcss autoprefixer", {
    stdio: "inherit",
  });
  execSync("npx tailwindcss init -p", { stdio: "inherit" });

  console.log("Configuring Tailwind CSS...");
  const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.js");
  const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
  `;
  fs.writeFileSync(tailwindConfigPath, tailwindConfig, "utf8");

  const postcssConfigPath = path.join(process.cwd(), "postcss.config.cjs");
  const postcssConfig = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
  `;
  fs.writeFileSync(postcssConfigPath, postcssConfig, "utf8");

  const cssPath = path.join(process.cwd(), "src", "index.css");
  const cssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;
  `;
  fs.writeFileSync(cssPath, cssContent, "utf8");

  // Modify App.jsx as requested
  const appPath = path.join(process.cwd(), "src", "App.jsx");
  const appContent = `
import "./App.css";

function App() {
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </>
  );
}

export default App;
  `;
  fs.writeFileSync(appPath, appContent, "utf8");

  console.log(`Setup complete. Project ${projectName} created successfully!`);
}

const projectName = process.argv[2];
createReactViteTailwindApp(projectName);
