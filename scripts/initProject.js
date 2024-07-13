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

  console.log("Configuring Tailwind CSS...");
  const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.js");
  const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
export default {
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

  // Safely remove postcss.config.cjs and create postcss.config.json
  safeUnlink(path.join(process.cwd(), "postcss.config.cjs"));
  const postcssConfigPath = path.join(process.cwd(), "postcss.config.json");
  const postcssConfig = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
  fs.writeFileSync(
    postcssConfigPath,
    JSON.stringify(postcssConfig, null, 2),
    "utf8"
  );

  const cssPath = path.join(process.cwd(), "src", "index.css");
  const cssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;
  `;
  fs.writeFileSync(cssPath, cssContent, "utf8");

  // Modify App.jsx and remove all content from App.css
  const appPath = path.join(process.cwd(), "src", "App.jsx");
  const appContent = `
import "./App.css";

function App() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </div>
  );
}

export default App;
  `;
  fs.writeFileSync(appPath, appContent, "utf8");

  // Clear App.css
  fs.writeFileSync(path.join(process.cwd(), "src", "App.css"), "", "utf8");

  // Safely remove SVG files
  safeUnlink(path.join(process.cwd(), "public", "vite.svg"));
  safeUnlink(path.join(process.cwd(), "src", "assets", "react.svg"));

  // Install ESLint if requested
  const inquirer = await import("inquirer");
  const answers = await inquirer.default.prompt([
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

    // Safely remove .eslintrc.cjs if it exists
    safeUnlink(path.join(process.cwd(), ".eslintrc.cjs"));

    const eslintConfigPath = path.join(process.cwd(), ".eslintrc.json");
    const eslintConfigContent = {
      extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
      ],
      plugins: ["react-refresh", "jsx-a11y", "react-hooks"],
      rules: {
        "prettier/prettier": ["error", { endOfLine: "auto" }],
        "no-unused-vars": "warn",
        "no-console": "off",
        "func-names": "off",
        "no-process-exit": "off",
        "object-shorthand": "off",
        "class-methods-use-this": "off",
        "react/jsx-no-target-blank": "off",
        "react-refresh/only-export-components": [
          "warn",
          { allowConstantExport: true },
        ],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      settings: { react: { version: "18.2" } },
    };

    fs.writeFileSync(
      eslintConfigPath,
      JSON.stringify(eslintConfigContent, null, 2),
      "utf8"
    );
  }

  if (answers.setupPrettier) {
    console.log("Installing Prettier and related plugins...");
    execSync(
      "npm install -D prettier prettier-plugin-tailwindcss @trivago/prettier-plugin-sort-imports",
      {
        stdio: "inherit",
      }
    );

    const prettierConfigPath = path.join(process.cwd(), ".prettierrc.json");
    const prettierConfigContent = {
      plugins: [
        "@trivago/prettier-plugin-sort-imports",
        "prettier-plugin-tailwindcss",
      ],
      importOrder: [
        "^react$",
        "^next",
        "<THIRD_PARTY_MODULES>",
        "^@/components/(.*)$",
        "^@/hooks/(.*)$",
        "^@/utils/(.*)$",
        "^[./]",
      ],
      importOrderSeparation: true,
      importOrderSortSpecifiers: true,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
    };

    fs.writeFileSync(
      prettierConfigPath,
      JSON.stringify(prettierConfigContent, null, 2),
      "utf8"
    );
  }

  console.log(`Setup complete. Project ${projectName} created successfully!`);
}

(async () => {
  const inquirer = await import("inquirer");
  const currentDirName = path.basename(process.cwd());

  const answers = await inquirer.default.prompt([
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
