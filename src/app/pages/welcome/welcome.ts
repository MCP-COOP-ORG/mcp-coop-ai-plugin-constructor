import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { BUILDER_DICTIONARY, APP_ROUTES } from '@shared/constants';
import { TextFormatPipe } from '@shared/pipes';

@Component({
    selector: 'app-welcome',
    imports: [RouterLink, TuiButton, NgOptimizedImage, TextFormatPipe],
    templateUrl: './welcome.html',
    styleUrl: './welcome.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Welcome {
    readonly view = {
        labels: BUILDER_DICTIONARY.labels,
        buttons: BUILDER_DICTIONARY.buttons,
        assets: BUILDER_DICTIONARY.assets,
        routes: APP_ROUTES,
    } as const;
}
