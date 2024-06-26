# `vite-tailwind-react-setup`

## Overview

`vite-tailwind-react-setup` is a CLI tool to create a new React project with Vite and Tailwind CSS. It simplifies the setup process by automating the installation and configuration steps.

## Installation

To install the CLI tool globally on your system, use the following command:

```bash
npm install -g vite-tailwind-react-setup
```
## Usage
Creating a New Project
To create a new React project with Vite and Tailwind CSS, run the following command:
```
new-react-app
```
You will be prompted to enter the project name and directory. If you hit enter without specifying anything, it will use the current directory name and place the project files in the current directory.

### Steps
* Open Terminal:
* Open your terminal or command prompt.

**Run the Command:**

```
new-react-app
```
**Follow Prompts:**

**Project Name:** Enter your project name or leave blank to use the current directory name.
***Directory:** Enter the directory to create the project in or leave blank to use the current directory.

**Example**
```
$ new-react-app
? Enter your project name (leave blank to use current directory): my-awesome-app
? Enter the directory to create the project in (leave blank to use current directory): /path/to/project
This will create a new React project with Vite and Tailwind CSS in the specified directory.
```
## Features
* Automates the setup of React with Vite and Tailwind CSS.
* Configures tailwind.config.js and postcss.config.cjs.
** Includes an example App.jsx file with Tailwind CSS classes.

**Project Structure**
After running the command, the project structure will look like this:
```
my-awesome-app/
├── index.html
├── package.json
├── postcss.config.cjs
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── tailwind.config.js
└── vite.config.js
```

**Configuration**

***tailwind.config.js***
The tailwind.config.js file is pre-configured to look for content in index.html and the src directory:

```
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
```

***postcss.config.cjs***
The postcss.config.cjs file includes Tailwind CSS and Autoprefixer plugins:

```
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

***Example App.jsx***
The App.jsx file includes an example usage of Tailwind CSS classes:

```
import "./App.css";
function App() {
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </>
  );
}
export default App;
```

## Author
Subhro Kar

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.