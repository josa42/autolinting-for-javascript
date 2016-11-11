import {
    commands,
    ExtensionContext,
    StatusBarItem,
    StatusBarAlignment,
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
    const autoLinter = new AutoLinter();
    let disposable = commands.registerCommand('extension.setLinter', () => autoLinter.autosetLinters());
    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function updateConfigIfChanged(section: string, value: any) {
    const config = workspace.getConfiguration();

    if (config.get(section) !== value) {
        config.update(section, value, false);
    }
}

class AutoLinter {

    statusBarItem: StatusBarItem;

    get isEnabled(): boolean {
        return <boolean>workspace.getConfiguration().get('jsAutolint.enable');
    }

    get showStatus(): boolean {
        return <boolean>workspace.getConfiguration().get('jsAutolint.showStatus');
    }

    get defaultLinters(): LinterConfig[] {
        const settings = workspace.getConfiguration().get<string[]>('jsAutolint.defaultLinters');

        return settings.map((setting) => {
            return LINTERS.find((linter) => linter.enableConfig.startsWith(setting));
        });
    }

    constructor() {
        if (this.isEnabled) {
            this.autosetLinters();
        }

        workspace.onDidChangeConfiguration(this.autosetLinters, this);
    }

    autosetLinters() {
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

        if (this.showStatus) {
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
                return typeof (<any>packageContent)[linter.packageJSONConfig] === 'object';
            });
        }

        return [];
    }

    setWorkspaceSettings(activeLinters: LinterConfig[]) {
        const lintersToActivate = activeLinters.length > 0 ? activeLinters : this.defaultLinters;

        LINTERS.forEach((linter) => {
            const isActive = lintersToActivate.indexOf(linter) !== -1;
            updateConfigIfChanged(linter.enableConfig, isActive);
        });
    }

    setStatusbarInformation(activeLinters: LinterConfig[]) {
        if (!this.statusBarItem) {
            this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
            this.statusBarItem.tooltip = 'Active linters';
        }

        const lintersToList = activeLinters.length > 0 ? activeLinters : this.defaultLinters;

        if (lintersToList.length === 0) {
            this.statusBarItem.hide();
            return;
        }

        const activeLintersText = lintersToList.map((linter) => linter.name).join(', ');

        this.statusBarItem.text = `$(info) ${activeLintersText}`;
        this.statusBarItem.show();
    }
}
