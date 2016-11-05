import {
    commands,
    ExtensionContext,
    window,
    workspace
} from 'vscode';

import * as fs from 'fs';
import * as path from 'path';

import { LINTERS, LinterConfig } from './linter-configs';

export function activate(context: ExtensionContext) {
    let disposable = commands.registerCommand('extension.setLinter', () => autosetLinters());
    context.subscriptions.push(disposable);

    autosetLinters();
}

export function deactivate() {
}


function autosetLinters() {
    const { rootPath } = workspace;

    if (!rootPath) {
        return;
    }

    const lintersInProject = findLintersInProject();
    setWorkspaceSettings(lintersInProject);
}

function findLintersInProject(): LinterConfig[] {
    const { rootPath } = workspace;

    return LINTERS.filter((linter) => {
        const configPath = path.join(rootPath, linter.configFile);
        return fs.existsSync(configPath);
    });
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
