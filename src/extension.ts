import {
    commands,
    ExtensionContext,
    StatusBarItem,
    StatusBarAlignment,
    window,
    workspace
} from 'vscode';
import * as vscode from 'vscode';

import * as fs from 'fs';
import * as path from 'path';

import {
    LinterConfig,
    LINTERS,
} from './linter-configs';

export function activate(context: ExtensionContext) {
    const autoLinter = new AutoLinter();
    let disposable = commands.registerCommand('extension.setLinter', () => autoLinter.autosetLinters());
    context.subscriptions.push(disposable);
}

export function deactivate() {
}

class AutoLinter {

    isEnabled: boolean;

    statusBarItem: StatusBarItem;

    constructor() {
        this.isEnabled = <boolean>workspace.getConfiguration().get('jsAutolint.enable');

        if (this.isEnabled) {
            this.autosetLinters();
        }

        workspace.onDidChangeConfiguration(this.autosetLinters, this);
    }

    autosetLinters() {
        // FIXME: Sometimes this is called way too often (probably triggered through configuration changes)
        const { rootPath } = workspace;

        if (!rootPath) {
            return;
        }

        let lintersInProject = [
            ...this.findLintersInWorkspace(),
            ...this.findLintersInPackageJSON()
        ];

        // Get rid of duplicate entries
        lintersInProject = [...new Set(lintersInProject)];

        this.setWorkspaceSettings(lintersInProject);

        const showStatus = <boolean>workspace.getConfiguration().get('jsAutolint.showStatus');

        if (showStatus) {
            this.setStatusbarInformation(lintersInProject);
        } else if (this.statusBarItem) {
            this.statusBarItem.hide();
        }
    }

    findLintersInWorkspace(): LinterConfig[] {
        const { rootPath } = workspace;

        return LINTERS.filter((linter) => {
            return linter.configFiles.some((file) => {
                const configPath = path.join(rootPath, file);
                return fs.existsSync(configPath);
            });
        });
    }

    findLintersInPackageJSON(): LinterConfig[] {
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

    setWorkspaceSettings(activeLinters: LinterConfig[]) {
        const config = workspace.getConfiguration();

        if (activeLinters.length > 0) {
            LINTERS.forEach((linter) => {
                const isActive = activeLinters.indexOf(linter) !== -1;

                // Prevent settings changed events if the value hasn't changed
                if (config.get(linter.enableConfig) !== isActive) {
                    config.update(linter.enableConfig, isActive, false);
                }
            });
        } else if (activeLinters.length === 0) {
            const defaultLinters = config.get<string[]>('jsAutolint.defaultLinters');
            defaultLinters.forEach((linter) => {
                // Prevent settings changed events if the value hasn't changed
                if (config.get(`${linter}.enable`) !== true) {
                    config.update(`${linter}.enable`, true, false);
                }
            });
        }
    }

    setStatusbarInformation(activeLinters: LinterConfig[]) {
        if (activeLinters.length <= 0) {
            return;
        }

        if (!this.statusBarItem) {
            this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
        }

        let activeLintersText = activeLinters.map((linter) => linter.name).join(', ');

        this.statusBarItem.text = `$(info) ${activeLintersText}`;
        this.statusBarItem.show();
    }
}
