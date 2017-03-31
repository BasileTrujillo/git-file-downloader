'use strict';

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;
const proxyquire =  require('proxyquire').noPreserveCache();
const mockedSuperagent = {
  get: () => mockedSuperagent,
  set: () => mockedSuperagent,
  redirects: () => mockedSuperagent,
  auth: () => mockedSuperagent,
  end: (func) => {
    func(false, {
      text: 'test'
    })
  }
};
const mockedSuperagentWithFailure = {
  get: () => mockedSuperagentWithFailure,
  set: () => mockedSuperagentWithFailure,
  redirects: () => mockedSuperagentWithFailure,
  auth: () => mockedSuperagentWithFailure,
  end: (func) => {
    func(new Error('superagent error'), {
      text: 'test'
    })
  }
};
const mockedFsExtra = {
    ensureDirSync: () => true,
    writeFile: (file, text, func) => func(false)
};
const mocks = {
  superagent: mockedSuperagent,
  'fs-extra':mockedFsExtra
};

const GitFileDownloader = proxyquire('../lib/git-file-downloader', mocks);

describe('Github tests', () => {
  it('Should download a file from Github without any credentials', () => {
    return new GitFileDownloader({
      provider: 'github',
      repository: 'foo/bar',
      branch: 'master',
      file: 'test.txt',
      output: '/tmp',
      keep_original_path: false
    }).run();
  });

  it('Should download a file from Github with OAuth Token', () => {
    return new GitFileDownloader({
      provider: 'github',
      repository: 'foo/bar',
      branch: 'master',
      file: 'test.txt',
      output: '/tmp',
      keep_original_path: false,
      oauth2_token: 'myAwesomeToken'
    }).run();
  });

  it('Should download a file from Github with Basic Auth Token', () => {
    return new GitFileDownloader({
      provider: 'github',
      repository: 'foo/bar',
      branch: 'master',
      file: 'test.txt',
      output: '/tmp',
      keep_original_path: false,
      basic_username: 'user',
      basic_password: 'pass'
    }).run();
  });
});

describe('Gitlab tests', () => {
  it('Should download a file from Gitlab without any credentials', () => {
    return new GitFileDownloader({
      provider: 'gitlab',
      repository: 'foo/bar',
      branch: 'master',
      file: 'test.txt',
      output: '/tmp',
      keep_original_path: false
    }).run();
  });

  it('Should download a file from Github with OAuth Token', () => {
    return new GitFileDownloader({
      provider: 'gitlab',
      repository: 'foo/bar',
      branch: 'master',
      file: 'test.txt',
      output: '/tmp',
      keep_original_path: false,
      private_token: 'myAwesomeToken'
    }).run();
  });

  it('Should download a file from Github without output', () => {
    return new GitFileDownloader({
      provider: 'gitlab',
      repository: 'foo/bar',
      branch: 'master',
      file: 'test.txt',
      keep_original_path: false,
      private_token: 'myAwesomeToken'
    }).run().then((output) => {
      expect(output).to.be.a.string('test');
    });
  });
});

describe('Failure tests', () => {
  it('Should fails to validate options', () => {
    expect(() => new GitFileDownloader()).to.throw(Error, /options validation error/);
  });

  it('Should fails to download a file', () => {
    const GitFileDownloader = proxyquire('../lib/git-file-downloader', {
      superagent: mockedSuperagentWithFailure,
      'fs-extra': mockedFsExtra
    });
    return expect(new GitFileDownloader({
      provider: 'gitlab',
      repository: 'foo/bar',
      branch: 'master',
      file: 'test.txt',
      output: '/tmp',
      keep_original_path: false
    }).run()).be.rejectedWith(Error);
  });

  it('Should fails to ensureDir', () => {
    const GitFileDownloader = proxyquire('../lib/git-file-downloader', {
      superagent: mockedSuperagent,
      'fs-extra': {
        ensureDirSync: () => {throw new Error('ensureDirSync error')},
        writeFile: (file, text, func) => func(false)
      }
    });
    return new GitFileDownloader({
      provider: 'gitlab',
      repository: 'foo/bar',
      branch: 'master',
      file: 'test.txt',
      output: '/tmp',
      keep_original_path: true
    }).run().catch((error) => {
      expect(error).to.be.instanceof(Error, 'ensureDirSync error');
    });
  });

  it('Should fails to write file', () => {
    const GitFileDownloader = proxyquire('../lib/git-file-downloader', {
      superagent: mockedSuperagent,
      'fs-extra': {
        ensureDirSync: () => true,
        writeFile: (file, text, func) => func(new Error('writeFile error'))
      }
    });
    return new GitFileDownloader({
      provider: 'gitlab',
      repository: 'foo/bar',
      branch: 'master',
      file: 'test.txt',
      output: '/tmp',
      keep_original_path: true
    }).run().catch((error) => {
      expect(error).to.be.instanceof(Error, 'writeFile error');
    });
  });
});