# Git File Downloader

[![NPM Badge](https://img.shields.io/npm/v/git-file-downloader.svg)](https://www.npmjs.com/package/git-file-downloader)
[![build status](https://gitlab.com/L0gIn/git-file-downloader/badges/master/build.svg)](https://gitlab.com/L0gIn/git-file-downloader/commits/master)
[![coverage report](https://gitlab.com/L0gIn/git-file-downloader/badges/master/coverage.svg)](https://l0gin.gitlab.io/git-file-downloader/coverage)
[![JsDoc report](https://img.shields.io/badge/link-jsdoc-green.svg)](https://l0gin.gitlab.io/git-file-downloader/jsdoc)
[![Plato report](https://img.shields.io/badge/link-plato-green.svg)](https://l0gin.gitlab.io/git-file-downloader/plato)

Git File Downloader is a CLI tool to download a raw file from Github or Gitlab.

## Install

```bash
    $ npm i -g git-file-downloader
```

## Usage

```bash

  Usage: gfd [options] <repository> <file>
  Or
  Usage: git-file-downloader [options] <repository> <file>

  Download a raw file from Github or Gitlab

  Options:

    -h, --help                          output usage information
    -V, --version                       output the version number
    -p, --provider <provider>           Set git provider. Supported providers: "github", "gitlab".
    -o, --output <path>                 Set the output directory. Default to current location.
    -k, --keep-original-path            Option to keep original path inside output directory. By default, it will place the single file inside output directory.
    -b, --branch <path>                 Set the branch name. Default to "master".
    --github-basic-username <username>  Set Github Basic Auth Username.
    --github-basic-password <password>  Set Github Basic Auth Password.
    --github-oauth-token <token>        Set Github OAuth2 Token.
    --gitlab-private-token <token>      Set Gitlab Private Token.

```

## Examples

### Download a file from a public github repository

```bash
    $ gfd L0gIn/devops-toolbox examples/nodejs-serverless.dotbox.json
```

### Download a file from a public gitlab repository

```bash
    $ gfd -p gitlab L0gIn/git-file-downloader README.md
```

## Use this package in your own project

```bash
    $ npm i --save git-file-downloader
    # Or
    $ yarn add git-file-downloader
```

```js
const GitFileDownloader = require('git-file-downloader');

const downloader = new GitFileDownloader({
      provider: 'gitlab',
      repository: 'L0gIn/git-file-downloader',
      branch: 'master',
      file: 'README.md',
      output: '.'
    });

downloader.run().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
```

More usages in `test/git-file-downloader.test.js`.