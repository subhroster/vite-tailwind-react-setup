#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function createReactViteTailwindApp(projectName, projectDir) {
  if (!projectName) {
    projectName = path.basename(process.cwd());
  }

  if (!projectDir) {
    projectDir = process.cwd();
  }

  const finalPath =
    projectDir === process.cwd()
      ? projectDir
      : path.join(projectDir, projectName);

  console.log(
    `Creating a new React project with Vite: ${projectName} in ${finalPath}`
  );
  execSync(
    `npm create vite@latest ${
      projectDir === process.cwd() ? "." : projectName
    } -- --template react`,
    {
      stdio: "inherit",
      cwd: projectDir,
    }
  );

  process.chdir(finalPath);
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

  // Install ESLint if requested
  const inquirer = await require("inquirer");
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "setupESLint",
      message: "Do you want to set up ESLint?",
      default: true,
    },
    {
      type: "confirm",
      name: "setupPrettier",
      message: "Do you want to set up Prettier?",
      default: true,
    },
  ]);

  if (answers.setupESLint) {
    console.log("Installing ESLint...");
    execSync(
      "npm install -D eslint eslint-plugin-react eslint-plugin-jsx-a11y",
      {
        stdio: "inherit",
      }
    );
    addESLintConfig(finalPath);
  }

  if (answers.setupPrettier) {
    console.log("Installing Prettier and related plugins...");
    execSync(
      "npm install -D prettier prettier-plugin-tailwindcss @trivago/prettier-plugin-sort-imports",
      {
        stdio: "inherit",
      }
    );
    addPrettierConfig(finalPath);
  }

  console.log(`Setup complete. Project ${projectName} created successfully!`);
}
function addPrettierConfig(projectPath) {
  const prettierConfigTemplate = path.join(
    __dirname,
    "templates",
    ".prettierrc.json"
  );
  const prettierConfigDest = path.join(projectPath, ".prettierrc.json");
  fs.copyFileSync(prettierConfigTemplate, prettierConfigDest);
  console.log("Added Prettier configuration");
}
function addESLintConfig(projectPath) {
  const eslintConfigTemplate = path.join(
    __dirname,
    "templates",
    ".eslintrc.json"
  );
  const eslintConfigDest = path.join(projectPath, ".eslintrc.json");
  fs.copyFileSync(eslintConfigTemplate, eslintConfigDest);
  console.log("Added ESLint configuration");
}

(async () => {
  const inquirer = await require("inquirer");
  const currentDirName = path.basename(process.cwd());

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message:
        "Enter your project name (leave blank to use current directory):",
      default: "",
    },
    {
      type: "input",
      name: "projectDir",
      message:
        "Enter the directory to create the project in (leave blank to use current directory):",
      default: "",
    },
  ]);

  const projectName = answers.projectName || currentDirName;
  const projectDir = answers.projectDir || process.cwd();

  await createReactViteTailwindApp(projectName, projectDir);
})();
