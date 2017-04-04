'use strict';

const joi = require('joi');
const fs = require('fs-extra');
const path = require('path');
const request = require('superagent');

class GitFileDownloader {
  /**
   * @param {Object} options Options
   * @param {String} options.provider 'github' | 'gitlab'
   * @param {String} options.repository Repository identifier (owner/repository)
   * @param {String} options.branch Repository branch (Default to master)
   * @param {String} options.file File to download
   * @param {String} options.write_to path to write file (if undefined, file content is passed to Promise resolver
   * @param {String} options.private_token Gitlab Private Token
   * @param {String} options.oauth2_token Github OAuth2 Token
   * @param {String} options.basic_username Github Basic Auth Username
   * @param {String} options.basic_password Github Basic Auth Password
   */
  constructor(options) {
    const optSchema = joi.object().keys({
      provider: joi.string().allow([
        'github',
        'gitlab'
      ]).required(),
      repository: joi.string().required(),
      branch: joi.string().default('master'),
      file: joi.string().required(),
      output: joi.string().default(null),
      keep_original_path: joi.boolean().default(false),
      private_token: joi.string().default(null),  // Gitlab
      oauth2_token: joi.string().default(null),   // Github
      basic_username: joi.string().default(null), // Github
      basic_password: joi.string().default(null)  // Github
    }).unknown().required();

    const validatedOptions = joi.validate(options, optSchema);

    if (validatedOptions.error) {
      throw new Error(this.constructor.name + ' options validation error: ' + validatedOptions.error.message);
    }

    this.options = validatedOptions.value;

    this.headers = {};

    switch (this.options.provider) {
      case 'github':
      default:
        this.url = GitFileDownloader.GithubRawBaseUrl + [
          this.options.repository,
          this.options.branch,
          this.options.file
        ].join('/');

        this.headers.Accept = 'application/vnd.github.v3.raw';
        if (this.options.oauth2_token !== null) {
          this.headers.Authorization = 'token ' + this.options.oauth2_token;
        }
        break;

      case 'gitlab':
        this.url = GitFileDownloader.GitlabRawBaseUrl + [
          this.options.repository,
          'raw',
          this.options.branch,
          this.options.file
        ].join('/');

        if (this.options.private_token !== null) {
          this.url += '?private_token=' + this.options.private_token;
        }
        break;
    }
  }

  /**
   * Download and write file if necessary
   *
   * @return {Promise} The promise of Download and write
   */
  run() {
    return new Promise((resolve, reject) => {
      const req = request.get(this.url)
                         .redirects(0);

      // Setup headers
      for (const key in this.headers) {
        req.set(key, this.headers[key]);
      }

      // Setup Basic Auth
      if (this.options.basic_username !== null && this.options.basic_password !== null) {
        req.auth(this.options.basic_username, this.options.basic_password);
      }

      // Send the request
      req.end((requestError, res) => {
        if (!requestError) {
          if (this.options.output === null) {
            resolve(res.text);
          } else {
            let fileSubPath = path.basename(this.options.file);

            if (this.options.keep_original_path) {
              fileSubPath = this.options.file;
              try {
                fs.ensureDirSync(path.dirname(fileSubPath));
              } catch (ensureDirerror) {
                reject(ensureDirerror);
              }
            }

            const filePath = path.join(this.options.output, fileSubPath);

            // Write file
            fs.writeFile(filePath, res.text, writeError => {
              if (writeError) {
                reject(writeError);
              } else {
                resolve(true);
              }
            });
          }
        } else {
          requestError.message = 'Error while downloading file. Please check options and token.';
          reject(requestError);
        }
      });
    });
  }
}

GitFileDownloader.GithubRawBaseUrl = 'https://raw.githubusercontent.com/';
GitFileDownloader.GitlabRawBaseUrl = 'https://gitlab.com/';

module.exports = GitFileDownloader;