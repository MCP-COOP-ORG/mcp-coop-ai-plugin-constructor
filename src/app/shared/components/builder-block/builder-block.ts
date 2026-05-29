import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';

import { BUILDER_DICTIONARY } from '@shared/constants';

@Component({
    selector: 'app-builder-block',
    imports: [TuiIcon, TuiCardLarge, TuiBadge, KeyValuePipe],
    templateUrl: './builder-block.html',
    styleUrl: './builder-block.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderBlock {
    readonly dictionary = BUILDER_DICTIONARY;

    title = input.required<string>();
    icon = input.required<string>();
    events = input<Record<string, string>>();
    description = input<string>();
    isDefault = input<boolean>();
}
