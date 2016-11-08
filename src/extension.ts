import {
    commands,
    ExtensionContext,
    window,
    workspace
} from 'vscode';

import * as fs from 'fs';
import * as path from 'path';

import {
    LinterConfig,
    LINTERS,
} from './linter-configs';

export function activate(context: ExtensionContext) {
    let disposable = commands.registerCommand('extension.setLinter', () => autosetLinters());
    context.subscriptions.push(disposable);

    const isEnabled = <boolean>workspace.getConfiguration().get('jsAutolint.enable');

    if (isEnabled === false) {
        return;
    }
    autosetLinters();
}

export function deactivate() {
}


function autosetLinters() {
    const { rootPath } = workspace;

    if (!rootPath) {
        return;
    }

    let lintersInProject = [
        ...findLintersInWorkspace(),
        ...findLintersInPackageJSON()
    ];

    // Get rid of duplicate entries
    lintersInProject = [...new Set(lintersInProject)];

    setWorkspaceSettings(lintersInProject);
}

function findLintersInWorkspace(): LinterConfig[] {
    const { rootPath } = workspace;

    return LINTERS.filter((linter) => {
        return linter.configFiles.some((file) => {
            const configPath = path.join(rootPath, file);
            return fs.existsSync(configPath);
        });
    });
}

function findLintersInPackageJSON(): LinterConfig[] {
    const { rootPath } = workspace;
    const packageJSONPath = path.join(rootPath, 'package.json');

    if (fs.existsSync(packageJSONPath)) {
        let packageContent = {};
        try {
            packageContent = JSON.parse(fs.readFileSync(packageJSONPath, 'utf8'));
        } catch (e) {}

        return LINTERS.filter((linter) => {
            return typeof packageContent[linter.packageJSONConfig] === 'object';
        });
    }

    return [];
}

function setWorkspaceSettings(activeLinters: LinterConfig[]) {
    const config = workspace.getConfiguration();
    LINTERS.forEach((linter) => {
        const isActive = activeLinters.indexOf(linter) !== -1;
        config.update(linter.enableConfig, isActive, false);
    });

    if (activeLinters.length === 0) {
        const defaultLinters = config.get<string[]>('jsAutolint.defaultLinters');
        defaultLinters.forEach((linter) => {
            config.update(`${linter}.enable`, true, false);
        });
    }
}
