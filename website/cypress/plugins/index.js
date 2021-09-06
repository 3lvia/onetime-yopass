/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
const path = require('path');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', (browser = {}, launchOptions) => {
    console.log(launchOptions.args) // print all current args

    const downloadDirectory = path.join(__dirname, '..', 'downloads');
    if (browser.family === 'chromium' && browser.isHeaded) {
      launchOptions.preferences.default['download'] = {
        default_directory: downloadDirectory,
      };
    }

    // https://docs.cypress.io/api/plugins/browser-launch-api#Modify-browser-launch-arguments
    console.log(launchOptions.args) // print all current args

    if (browser.family === 'chromium' && browser.name !== 'electron') {
      // auto open devtools
      launchOptions.args.push('--auto-open-devtools-for-tabs')
    }

    if (browser.family === 'firefox') {
      // auto open devtools
      launchOptions.args.push('-devtools')
    }

    if (browser.name === 'electron') {
      // auto open devtools
      launchOptions.preferences.devTools = true
    }

    return launchOptions;
  });
};
