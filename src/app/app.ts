import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TUI_DARK_MODE, TuiRoot } from '@taiga-ui/core';
import { AppHeader } from '@shared/components';

import { BUILDER_DICTIONARY } from '@shared/constants';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, TuiRoot, AppHeader],
    templateUrl: './app.html',
    styleUrl: './app.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
    protected readonly darkMode = inject(TUI_DARK_MODE);

    constructor() {
        try {
            const themeKey = BUILDER_DICTIONARY.storageKeys.theme;
            const darkVal = BUILDER_DICTIONARY.theme.dark;
            const lightVal = BUILDER_DICTIONARY.theme.light;

            // 1. Initial sync from platform theme
            const platformTheme = localStorage.getItem(themeKey);

            if (platformTheme === darkVal) {
                this.darkMode.set(true);
            } else {
                this.darkMode.set(false);
            }

            // 2. Sync toggles back to platform theme
            effect(() => {
                if (this.darkMode() === true) {
                    localStorage.setItem(themeKey, darkVal);
                } else {
                    localStorage.setItem(themeKey, lightVal);
                }
            });
        } catch {
            this.darkMode.set(false);
        }
    }
}
