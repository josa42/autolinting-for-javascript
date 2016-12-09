export interface LinterConfig {
    name: string;
    configFiles: string[];
    enableConfig: string;
    packageJSONConfig?: string;
    packageDependency?: string;
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
        enableConfig: 'eslint.enable',
        packageJSONConfig: 'eslintConfig'
    },
    {
        name: 'JSHint',
        configFiles: [
            '.jshintrc'
        ],
        enableConfig: 'jshint.enable',
        packageJSONConfig: 'jshintConfig'
    },
    {
        name: 'JSCS',
        configFiles: [
            '.jscsrc',
            '.jscs.json'
        ],
        enableConfig: 'jscs.enable',
        packageJSONConfig: 'jscsConfig'
    },
    {
        name: 'Standard',
        configFiles: [],
        enableConfig: 'standard.enable',
        packageJSONConfig: 'jscsConfig',
        packageDependency: 'standard'
    },
    {
        name: 'TSLint',
        configFiles: [
            'tslint.json'
        ],
        enableConfig: 'tslint.enable'
    }
];
