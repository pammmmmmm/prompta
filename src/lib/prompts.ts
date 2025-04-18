import inquirer from 'inquirer';
import Conf from 'conf';
import chalk from 'chalk';
import clipboardy from 'clipboardy';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createInterface } from 'readline';

// Define types for our application
interface Parameter {
  name: string;
  default: string;
}

interface Prompt {
  id: string;
  name: string;
  content: string;
  parameters: Parameter[];
  createdAt: string;
  updatedAt?: string;
}

// Set VS Code as the preferred editor
process.env.EDITOR = 'code --wait';

// Create config store for prompts
const config = new Conf<{
  prompts: Prompt[];
}>({
  projectName: 'prompta',
  configName: 'prompts'
});

// Initialize prompts if they don't exist
if (!config.has('prompts')) {
  config.set('prompts', []);
}

/**
 * Create a new prompt
 */
export async function createPrompt(): Promise<void> {
  const { name, useEditor } = await inquirer.prompt<{
    name: string;
    useEditor: boolean;
  }>([
    {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the prompt:',
      validate: (input: string) => input.trim() ? true : 'Name is required'
    },
    {
      type: 'confirm',
      name: 'useEditor',
      message: 'Would you like to use VS Code to write your prompt?',
      default: true
    }
  ]);
  
  let content: string;
  
  if (useEditor) {
    console.log(chalk.blue('\nOpening VS Code to edit your prompt...'));
    console.log(chalk.yellow('Use {{paramName}} syntax for parameters in your prompt.'));
    console.log(chalk.yellow('Save the file and close VS Code when you are done.'));

    // Create a temporary file
    const tmpFile = path.join(os.tmpdir(), `prompta-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, '# Write your prompt here\n# Use {{paramName}} syntax for parameters\n\n');
    
    try {
      // Open VS Code and wait for it to close
      execSync(`code --wait "${tmpFile}"`);
      console.log(chalk.green('\nVS Code closed. Reading prompt content...'));
      
      // Read the content from the file
      content = fs.readFileSync(tmpFile, 'utf8');
      
      // Clean up the file
      fs.unlinkSync(tmpFile);
      
      // Remove the instruction comments
      content = content.replace(/# Write your prompt here\n# Use {{paramName}} syntax for parameters\n\n/, '');
      
      if (!content.trim()) {
        console.log(chalk.red('Error: No content was provided. Aborting prompt creation.'));
        return;
      }
    } catch (error) {
      console.error(chalk.red('Error opening VS Code:'), error instanceof Error ? error.message : String(error));
      return;
    }
  } else {
    // Use multi-line input instead of editor
    console.log(chalk.blue('\nEnter your prompt content below. Use {{paramName}} for parameters.'));
    console.log(chalk.yellow('Press Enter twice when finished.'));
    
    const lines: string[] = [];
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    await new Promise<void>((resolve) => {
      let emptyLines = 0;
      
      readline.on('line', (line) => {
        if (line.trim() === '') {
          emptyLines++;
          if (emptyLines === 2) {
            readline.close();
            resolve();
          }
        } else {
          emptyLines = 0;
          lines.push(line);
        }
      });
    });
    
    content = lines.join('\n');
    
    if (!content.trim()) {
      console.log(chalk.red('Error: Content is required.'));
      return;
    }
  }

  // Detect parameters
  const paramMatches = content.match(/{{([^}]+)}}/g) || [];
  const uniqueParams = [...new Set(paramMatches.map(p => p.replace(/{{|}}/g, '')))];
  
  let parameters: Parameter[] = [];
  if (uniqueParams.length > 0) {
    console.log(chalk.blue(`\nDetected parameters: ${uniqueParams.join(', ')}`));
    
    // Ask for default values for each parameter
    const paramQuestions = uniqueParams.map(param => ({
      type: 'input',
      name: param,
      message: `Default value for ${param} (leave empty for no default):`
    }));
    
    const paramAnswers = await inquirer.prompt<Record<string, string>>(paramQuestions);
    
    parameters = uniqueParams.map(param => ({
      name: param,
      default: paramAnswers[param] || ''
    }));
  } else {
    console.log(chalk.yellow('\nNo parameters detected in the prompt. Use {{paramName}} syntax to define parameters.'));
  }

  const prompts = config.get('prompts');
  prompts.push({
    id: Date.now().toString(),
    name,
    content,
    parameters,
    createdAt: new Date().toISOString()
  });

  config.set('prompts', prompts);
}

/**
 * List all saved prompts
 */
export async function listPrompts(): Promise<void> {
  const prompts = config.get('prompts');
  
  if (prompts.length === 0) {
    console.log(chalk.yellow('No prompts found. Create one using the create command.'));
    return;
  }

  console.log(chalk.blue('\nSaved Prompts:'));
  prompts.forEach((prompt, index) => {
    console.log(`${chalk.green(index + 1)}. ${chalk.white(prompt.name)} ${
      prompt.parameters.length > 0 
        ? chalk.yellow(`(${prompt.parameters.length} parameters)`) 
        : ''
    }`);
  });

  // Ask if user wants to see details of a prompt
  const { viewDetails } = await inquirer.prompt<{ viewDetails: boolean }>([
    {
      type: 'confirm',
      name: 'viewDetails',
      message: 'Do you want to view details of a prompt?',
      default: false
    }
  ]);

  if (viewDetails) {
    const { promptIndex } = await inquirer.prompt<{ promptIndex: number }>([
      {
        type: 'number',
        name: 'promptIndex',
        message: 'Enter the number of the prompt to view:',
        validate: (input: number) => {
          const index = parseInt(String(input));
          return index > 0 && index <= prompts.length 
            ? true 
            : `Please enter a number between 1 and ${prompts.length}`;
        }
      }
    ]);

    const selectedPrompt = prompts[promptIndex - 1];
    console.log(chalk.blue('\nPrompt Details:'));
    console.log(chalk.white(`Name: ${selectedPrompt.name}`));
    console.log(chalk.white(`Content:\n${selectedPrompt.content}`));
    
    if (selectedPrompt.parameters.length > 0) {
      console.log(chalk.white('\nParameters:'));
      selectedPrompt.parameters.forEach(param => {
        console.log(`- ${param.name}${param.default ? ` (default: "${param.default}")` : ''}`);
      });
    }

    // Ask if user wants to copy the prompt to clipboard
    const { copyPrompt } = await inquirer.prompt<{ copyPrompt: boolean }>([
      {
        type: 'confirm',
        name: 'copyPrompt',
        message: 'Copy this prompt to clipboard?',
        default: false
      }
    ]);

    if (copyPrompt) {
      clipboardy.writeSync(selectedPrompt.content);
      console.log(chalk.green('Prompt copied to clipboard!'));
    }
  }
}

/**
 * Edit an existing prompt
 */
export async function editPrompt(): Promise<void> {
  const prompts = config.get('prompts');
  
  if (prompts.length === 0) {
    console.log(chalk.yellow('No prompts found. Create one using the create command.'));
    return;
  }

  // Select prompt to edit
  const { promptIndex } = await inquirer.prompt<{ promptIndex: number }>([
    {
      type: 'list',
      name: 'promptIndex',
      message: 'Select a prompt to edit:',
      choices: prompts.map((prompt, index) => ({
        name: `${prompt.name} ${
          prompt.parameters.length > 0 
            ? chalk.yellow(`(${prompt.parameters.length} parameters)`) 
            : ''
        }`,
        value: index
      }))
    }
  ]);

  const selectedPrompt = prompts[promptIndex];

  // Edit prompt name
  const { name, useEditor } = await inquirer.prompt<{
    name: string;
    useEditor: boolean;
  }>([
    {
      type: 'input',
      name: 'name',
      message: 'Enter a new name for the prompt (leave empty to keep existing):',
      default: selectedPrompt.name
    },
    {
      type: 'confirm',
      name: 'useEditor',
      message: 'Would you like to use VS Code to edit your prompt?',
      default: true
    }
  ]);

  let content: string;
  
  if (useEditor) {
    console.log(chalk.blue('\nOpening VS Code to edit your prompt...'));
    console.log(chalk.yellow('Use {{paramName}} syntax for parameters in your prompt.'));
    console.log(chalk.yellow('Save the file and close VS Code when you are done.'));

    // Create a temporary file with the existing content
    const tmpFile = path.join(os.tmpdir(), `prompta-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, selectedPrompt.content);
    
    try {
      // Open VS Code and wait for it to close
      execSync(`code --wait "${tmpFile}"`);
      console.log(chalk.green('\nVS Code closed. Reading prompt content...'));
      
      // Read the content from the file
      content = fs.readFileSync(tmpFile, 'utf8');
      
      // Clean up the file
      fs.unlinkSync(tmpFile);
      
      if (!content.trim()) {
        console.log(chalk.red('Error: No content was provided. Keeping original content.'));
        content = selectedPrompt.content;
      }
    } catch (error) {
      console.error(chalk.red('Error opening VS Code:'), error instanceof Error ? error.message : String(error));
      return;
    }
  } else {
    // Use multi-line input instead of editor
    console.log(chalk.blue('\nEdit your prompt content below. Use {{paramName}} for parameters.'));
    console.log(chalk.blue('Current content:'));
    console.log(chalk.white(selectedPrompt.content));
    console.log(chalk.yellow('\nEnter your new content (press Enter twice when finished):'));
    
    const lines: string[] = [];
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    await new Promise<void>((resolve) => {
      let emptyLines = 0;
      
      readline.on('line', (line) => {
        if (line.trim() === '') {
          emptyLines++;
          if (emptyLines === 2) {
            readline.close();
            resolve();
          }
        } else {
          emptyLines = 0;
          lines.push(line);
        }
      });
    });
    
    content = lines.join('\n');
    
    if (!content.trim()) {
      console.log(chalk.yellow('No content entered. Keeping original content.'));
      content = selectedPrompt.content;
    }
  }

  // Detect parameters
  const paramMatches = content.match(/{{([^}]+)}}/g) || [];
  const uniqueParams = [...new Set(paramMatches.map(p => p.replace(/{{|}}/g, '')))];
  
  let parameters = selectedPrompt.parameters;
  
  if (uniqueParams.length > 0) {
    console.log(chalk.blue(`\nDetected parameters: ${uniqueParams.join(', ')}`));
    
    const { updateParams } = await inquirer.prompt<{ updateParams: boolean }>([
      {
        type: 'confirm',
        name: 'updateParams',
        message: 'Do you want to update parameter default values?',
        default: true
      }
    ]);
    
    if (updateParams) {
      // Preserve existing defaults where possible
      const paramQuestions = uniqueParams.map(param => {
        const existingParam = selectedPrompt.parameters.find(p => p.name === param);
        return {
          type: 'input',
          name: param,
          message: `Default value for ${param}:`,
          default: existingParam ? existingParam.default : ''
        };
      });
      
      const paramAnswers = await inquirer.prompt<Record<string, string>>(paramQuestions);
      
      parameters = uniqueParams.map(param => ({
        name: param,
        default: paramAnswers[param] || ''
      }));
    }
  } else {
    console.log(chalk.yellow('\nNo parameters detected in the prompt.'));
    parameters = [];
  }

  // Update prompt
  prompts[promptIndex] = {
    ...selectedPrompt,
    name,
    content,
    parameters,
    updatedAt: new Date().toISOString()
  };

  config.set('prompts', prompts);
}

/**
 * Execute a prompt with parameters
 */
export async function executePrompt(): Promise<void> {
  const prompts = config.get('prompts');
  
  if (prompts.length === 0) {
    console.log(chalk.yellow('No prompts found. Create one using the create command.'));
    return;
  }

  // Select prompt to execute
  const { promptIndex } = await inquirer.prompt<{ promptIndex: number }>([
    {
      type: 'list',
      name: 'promptIndex',
      message: 'Select a prompt to execute:',
      choices: prompts.map((prompt, index) => ({
        name: `${prompt.name} ${
          prompt.parameters.length > 0 
            ? chalk.yellow(`(${prompt.parameters.length} parameters)`) 
            : ''
        }`,
        value: index
      }))
    }
  ]);

  const selectedPrompt = prompts[promptIndex];
  let promptContent = selectedPrompt.content;

  // If prompt has parameters, ask for values
  if (selectedPrompt.parameters.length > 0) {
    const paramQuestions = selectedPrompt.parameters.map(param => ({
      type: 'input',
      name: param.name,
      message: `Value for ${param.name}:`,
      default: param.default
    }));

    const paramAnswers = await inquirer.prompt<Record<string, string>>(paramQuestions);

    // Replace parameters in prompt content
    Object.entries(paramAnswers).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      promptContent = promptContent.replace(regex, value);
    });
  }

  // Copy to clipboard
  clipboardy.writeSync(promptContent);
  console.log(chalk.green('✅ Prompt copied to clipboard!'));
  
  // Display the executed prompt
  console.log(chalk.blue('\nExecuted Prompt:'));
  console.log(chalk.white(promptContent));
}