export interface LinterConfig {
    name: string;
    configFiles: string[];
    extension: string;
    enableConfig: string;
    packageJSONConfig?: string;
}

export const LINTERS: LinterConfig[] = [
    {
        name: 'ESLint',
        configFiles: [
            '.eslintrc',
            '.eslintrc.js',
            '.eslintrc.yaml',
            '.eslintrc.yml',
            '.eslintrc.json'
        ],
        extension: 'vscode-eslint',
        enableConfig: 'eslint.enable',
        packageJSONConfig: 'eslintConfig'
    },
    {
        name: 'JSHint',
        configFiles: [
            '.jshintrc'
        ],
        extension: 'jshint',
        enableConfig: 'jshint.enable',
        packageJSONConfig: 'jshintConfig'
    },
    {
        name: 'JSCS',
        configFiles: [
            '.jscsrc'
        ],
        extension: 'jscs',
        enableConfig: 'jscs.enable'
    }
];
