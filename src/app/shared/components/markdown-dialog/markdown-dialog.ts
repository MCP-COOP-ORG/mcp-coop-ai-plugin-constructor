import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { MarkdownFormatPipe } from '@shared/pipes';

@Component({
    selector: 'app-markdown-dialog',
    imports: [MarkdownFormatPipe],
    templateUrl: './markdown-dialog.html',
    styleUrl: './markdown-dialog.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownDialog {
    readonly context = inject<TuiDialogContext<void, string>>(POLYMORPHEUS_CONTEXT);
}
