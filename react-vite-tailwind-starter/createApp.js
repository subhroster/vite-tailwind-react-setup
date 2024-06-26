const { execSync } = require('child_process');

function createReactViteTailwindApp(projectName) {
  if (!projectName) {
    console.log("Please specify the project name.");
    process.exit(1);
  }

  console.log(`Creating a new React project with Vite: ${projectName}`);
  execSync(`npm create vite@latest ${projectName} --template react`, { stdio: 'inherit' });

  process.chdir(projectName);
  console.log("Installing Tailwind CSS...");
  execSync('npm install -D tailwindcss postcss autoprefixer', { stdio: 'inherit' });
  execSync('npx tailwindcss init -p', { stdio: 'inherit' });

  console.log(`Setup complete. Project ${projectName} created successfully!`);
}

const projectName = process.argv[2];
createReactViteTailwindApp(projectName);
