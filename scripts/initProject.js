#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
function safeUnlink(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${filePath}`);
  } else {
    console.log(`File not found, skipping delete: ${filePath}`);
  }
}

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
  createFolderStructure(finalPath);
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

  //   const postcssConfigPath = path.join(process.cwd(), "postcss.config.cjs");
  //   const postcssConfig = `
  // module.exports = {
  //   plugins: {
  //     tailwindcss: {},
  //     autoprefixer: {},
  //   },
  // }
  //   `;
  //   fs.writeFileSync(postcssConfigPath, postcssConfig, "utf8");

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
  // Safely remove SVG files
  safeUnlink(path.join(process.cwd(), "public", "vite.svg"));
  safeUnlink(path.join(process.cwd(), "src", "assets", "react.svg"));
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
    {
      type: "confirm",
      name: "setupAirbnbESLint",
      message: "Do you want to set up Airbnb ESLint style?",
      default: false,
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
      "npm install -D prettier prettier-plugin-tailwindcss @trivago/prettier-plugin-sort-imports eslint-config-prettier --save-exact prettier eslint-plugin-prettier",
      {
        stdio: "inherit",
      }
    );
    addPrettierConfig(finalPath);
  }
  if (answers.setupESLint) {
    console.log("Installing ESLint...");
    if (answers.setupAirbnbESLint) {
      console.log("Setting up Airbnb ESLint style...");
      execSync(
        "npm uninstall eslint-plugin-react eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react-hooks",
        { stdio: "inherit" }
      );
      execSync(
        "npm install eslint@^8.2.0 eslint-plugin-react@^7.28.0 eslint-plugin-import@^2.25.3 eslint-plugin-jsx-a11y@^6.5.1 eslint-plugin-react-hooks@^4.3.0 --save-dev",
        { stdio: "inherit" }
      );
      execSync("npm install eslint-config-airbnb --save-dev", {
        stdio: "inherit",
      });
      addAirbnbESLintConfig(finalPath);
    } else {
      execSync(
        "npm install -D eslint eslint-plugin-react eslint-plugin-jsx-a11y",
        { stdio: "inherit" }
      );
      addESLintConfig(finalPath);
    }
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
    ".eslintrc.cjs"
  );
  const eslintConfigDest = path.join(projectPath, ".eslintrc.cjs");
  fs.copyFileSync(eslintConfigTemplate, eslintConfigDest);
  console.log("Added ESLint configuration");
}
function addAirbnbESLintConfig(projectPath) {
  const eslintConfigTemplate = path.join(
    __dirname,
    "templates",
    ".eslintrcairbnb.cjs"
  );
  const eslintConfigDest = path.join(projectPath, ".eslintrc.cjs");
  fs.copyFileSync(eslintConfigTemplate, eslintConfigDest);
  console.log("Added Airbnb ESLint configuration");
}
function createFolderStructure(projectPath) {
  const folders = ["components", "pages", "utils", "hooks"];
  folders.forEach((folder) => {
    const folderPath = path.join(projectPath, "src", folder);
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Created ${folder} folder`);
  });
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
