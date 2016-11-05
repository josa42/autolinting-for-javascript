# autolinting-for-javascript README

## Features

Automatically activates/deactivates the correct linters for your current Javascript workspace depending on which configuration files can be found.

## Requirements

eslint/jscs/jshint

## Extension Settings

If you want to set a default linter (in case no configuration can be found), you can add a setting to your configuration.

* `jsAutolint.defaultLinters`: Set to an Array containing all linters you want to activate if no known linter configuration can be found. (e.g. `["jshint", "jscs"]` or `["eslint"]`)

## Known Issues


## Release Notes

### 1.0.0

Initial release
