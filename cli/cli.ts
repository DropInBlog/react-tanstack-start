#!/usr/bin/env node
import { Command } from 'commander';
import { installTemplates } from './installer.js';

const program = new Command();

program
  .name('dropinblog-tanstack')
  .description('CLI to install DropInBlog templates for TanStack Start')
  .version('0.1.0');

program
  .command('install')
  .description('Install DropInBlog blog routes into your TanStack Start project')
  .option('-d, --dir <directory>', 'Target project directory', process.cwd())
  .option('-p, --path <segment>', 'URL path to mount the blog at (e.g. news)', 'blog')
  .action(async (options) => {
    try {
      await installTemplates(options.dir, options.path);
    } catch (error) {
      console.error('Installation failed:', error);
      process.exit(1);
    }
  });

program.parse();
