export interface LinterConfig {
    name: string;
    configFile: string;
    extension: string;
    enableConfig: string;
}

export const LINTERS: LinterConfig[] = [{
    name: 'ESLint',
    configFile: '.eslintrc',
    extension: 'vscode-eslint',
    enableConfig: 'eslint.enable'
}, {
    name: 'JSHint',
    configFile: '.jshintrc',
    extension: 'jshint',
    enableConfig: 'jshint.enable'
}, {
    name: 'JSCS',
    configFile: '.jscsrc',
    extension: 'jscs',
    enableConfig: 'jscs.enable'
}];
