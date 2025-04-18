<div align="center">
	<a href="https://sindresorhus.com/actions">
		<img src="./assets/logo.png" width="200" height="200">
	</a>
	<h1>Prompta</h1>
  <h3>A powerful CLI tool for managing AI prompts with modern features</h3>
</div>

<!-- <p align="center">
  <img src="https://github.com/yourusername/prompta/raw/main/assets/demo.gif" alt="Prompta Demo" width="800"/>
</p> -->

<br>

## Highlights

- **Parameter Substitution** - Use `{{paramName}}` syntax to create dynamic prompts
- **VS Code Integration** - Seamlessly edit prompts in your favorite editor
- **Instant Clipboard** - Copies processed prompts directly to your clipboard
- **Type Safety** - Built with TypeScript for reliability and great developer experience

<br>

## Features

<table>
  <tr>
    <td width="50%">
      <h3>Create Prompts</h3>
      <p>Save and organize your LLM prompts with an intuitive interface. Use your favorite editor or the terminal.</p>
    </td>
    <td width="50%">
      <h3>Parameters Support</h3>
      <p>Define variables with <code>{{paramName}}</code> syntax and set custom default values for each parameter.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Instant Clipboard</h3>
      <p>Execute prompts with parameters and get them instantly copied to your clipboard, ready to paste into any AI tool.</p>
    </td>
    <td width="50%">
      <h3>VS Code Integration</h3>
      <p>Seamlessly write and edit prompts in VS Code with proper syntax highlighting and a comfortable editing experience.</p>
    </td>
  </tr>
</table>

<br>

## Quick Start

### Installation

```bash
# Install globally
npm install -g prompta

# Verify installation
prompta --version
```

### Create Your First Prompt

```bash
prompta create
```

<br>

## Usage Guide

<details>
<summary><b>Creating Prompts</b></summary>
<br>

Run the command:
```bash
prompta create
```

This launches an interactive session where you:
1. Enter a name for your prompt
2. Choose between VS Code or terminal for writing your prompt
3. Define parameters using `{{paramName}}` syntax
4. Set default values for parameters

<img src="https://github.com/yourusername/prompta/raw/main/assets/create-annotated.png" alt="Create Command Annotated" width="700"/>

</details>

<details>
<summary><b>Listing Prompts</b></summary>
<br>

Run the command:
```bash
prompta list
```

This displays all saved prompts and allows you to:
- View details of specific prompts
- See parameter information
- Copy a prompt directly to clipboard

<img src="https://github.com/yourusername/prompta/raw/main/assets/list-annotated.png" alt="List Command Annotated" width="700"/>

</details>

<details>
<summary><b>Editing Prompts</b></summary>
<br>

Run the command:
```bash
prompta edit
```

Select a prompt to modify:
- Update the name
- Edit the content in VS Code or terminal
- Update parameters and default values

<img src="https://github.com/yourusername/prompta/raw/main/assets/edit-annotated.png" alt="Edit Command Annotated" width="700"/>

</details>

<details>
<summary><b>Executing Prompts</b></summary>
<br>

Run the command:
```bash
prompta run
```

Select a prompt to execute:
- Enter values for parameters (or use defaults)
- The processed prompt is automatically copied to clipboard
- View the final prompt with substituted parameters

<img src="https://github.com/yourusername/prompta/raw/main/assets/run-annotated.png" alt="Run Command Annotated" width="700"/>

</details>

<br>

## Examples

### Creating a Code Explanation Prompt

```
# After running 'prompta create'

? Enter a name for the prompt: Code explanation
? Would you like to use VS Code to write your prompt? Yes

# In VS Code, write:
Explain the following {{language}} code like I'm {{level}}:

```{{code}}```
```

### Running the Prompt with Parameters

```
# After running 'prompta run'

? Select a prompt to execute: Code explanation
? Value for language: JavaScript
? Value for level: a beginner
? Value for code: function hello() { console.log("Hello world"); }

✅ Prompt copied to clipboard!

Executed Prompt:
Explain the following JavaScript code like I'm a beginner:

```function hello() { console.log("Hello world"); }```
```

<br>

## Configuration

Your prompts are stored in a local configuration file using the [conf](https://github.com/sindresorhus/conf) package. The location depends on your operating system:

| OS | Path |
|---|---|
| **macOS** | `~/Library/Preferences/prompta-nodejs` |
| **Windows** | `%APPDATA%\prompta-nodejs` |
| **Linux** | `~/.config/prompta-nodejs` |

<br>

## Installation Options

### Global Installation (Recommended)

```bash
npm install -g prompta
```

### Local Development Installation

```bash
# Clone the repository
git clone https://github.com/sanjaysunil/prompta.git
cd prompta

# Install dependencies
npm install

# Build the project
npm run build

# Link for local use
npm link
```

<br>

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

<br>

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<br>
