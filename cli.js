#!/usr/bin/env node

'use strict';

const program = require('commander');
const appVersion = require('./package.json').version;
const chalk = require('chalk');
const GitFileDownloader = require('./lib/git-file-downloader');

const args = {};

program
    .version(appVersion)
    .description('Download a raw file from Github or Gitlab')
    .arguments('<repository> <file>')
    .action((repository, file) => {
      args.repository = repository;
      args.file = file;
    })
    .option(
        '-p, --provider <provider>',
        'Set git provider: "github", "gitlab". Default to "github"',
        'github'
    )
    .option(
        '-o, --output <path>',
        'Set the output directory. Default to current location.',
        '.'
    )
    .option(
        '-k, --keep-original-path',
        'Option to keep original path inside output directory. ' +
        'By default, it will place the single file inside output directory.'
    )
    .option(
        '-b, --branch <name>',
        'Set the branch name. Default to "master".',
        'master'
    )
    .option(
        '--github-basic-username <username>',
        'Set Github Basic Auth Username.'
    )
    .option(
        '--github-basic-password <password>',
        'Set Github Basic Auth Password.'
    )
    .option(
        '--github-oauth-token <token>',
        'Set Github OAuth2 Token.'
    )
    .option(
        '--gitlab-private-token <token>',
        'Set Gitlab Private Token.'
    )
    .parse(process.argv);

if (!args.repository) {
  console.error(chalk.bold.red('No <repository> given!'));
  program.outputHelp();
  process.exit(1);
} else {
  if (!args.file) {
    console.error(chalk.bold.red('No <file> given!'));
    program.outputHelp();
    process.exit(1);
  } else {
    new GitFileDownloader({
      provider: program.provider,
      repository: args.repository,
      branch: program.branch,
      file: args.file,
      output: program.output,
      keep_original_path: program.keepOriginalPath,
      private_token: program.gitlabPrivateToken,
      oauth2_token: program.githubOauthToken,
      basic_username: program.githubBasicUsername,
      basic_password: program.githubBasicPassword
    }).run()
      .catch(err => {
        console.log(chalk.red('Error : ' + chalk.bold(err.message)));
        process.exitCode = 1;
      });
  }
}
