#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createPrompt, editPrompt, listPrompts, executePrompt } from '../lib/prompts';

// Read version from package.json
import { version } from '../../package.json';

// CLI configuration
const program = new Command();

program
  .version(version)
  .description('A CLI tool for managing prompts for LLMs');

// Create a new prompt
program
  .command('create')
  .description('Create a new prompt')
  .action(async () => {
    try {
      await createPrompt();
      console.log(chalk.green('✅ Prompt created successfully!'));
    } catch (error) {
      console.error(chalk.red('Error creating prompt:'), error instanceof Error ? error.message : String(error));
    }
  });

// List all prompts
program
  .command('list')
  .description('List all saved prompts')
  .action(async () => {
    try {
      await listPrompts();
    } catch (error) {
      console.error(chalk.red('Error listing prompts:'), error instanceof Error ? error.message : String(error));
    }
  });

// Edit an existing prompt
program
  .command('edit')
  .description('Edit an existing prompt')
  .action(async () => {
    try {
      await editPrompt();
      console.log(chalk.green('✅ Prompt updated successfully!'));
    } catch (error) {
      console.error(chalk.red('Error editing prompt:'), error instanceof Error ? error.message : String(error));
    }
  });

// Execute a prompt with parameters
program
  .command('run')
  .description('Execute a prompt with parameters')
  .action(async () => {
    try {
      await executePrompt();
    } catch (error) {
      console.error(chalk.red('Error executing prompt:'), error instanceof Error ? error.message : String(error));
    }
  });

// Handle invalid commands
program
  .on('command:*', () => {
    console.error(chalk.red('Invalid command.'));
    console.log(`Use ${chalk.yellow('prompta --help')} to see available commands.`);
    process.exit(1);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}