import { Injectable, inject, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { TUI_CONFIRM } from '@taiga-ui/kit';

import { Observable } from 'rxjs';
import { MarkdownDialog } from '@shared/components';

/**
 * Centralized facade service for opening application dialogs.
 * Keeps UI components and Domain services decoupled from Taiga UI dialog boilerplate.
 */
@Injectable({
    providedIn: 'root',
})
export class DialogManager {
    private readonly dialogService = inject(TuiDialogService);
    private readonly injector = inject(Injector);

    openPresetDialog(): void {
        import('../components/preset-dialog/preset-dialog').then((m) => {
            this.dialogService
                .open(new PolymorpheusComponent(m.PresetDialogComponent, this.injector), { size: 'm' })
                .subscribe();
        });
    }

    openInfoDialog(title: string, content: string, size: 's' | 'm' | 'l' = 'm'): Observable<void> {
        return this.dialogService.open<void>(new PolymorpheusComponent(MarkdownDialog, this.injector), {
            label: title,
            size,
            data: content,
        });
    }

    openConfirmDialog(
        title: string,
        message: string,
        confirmLabel: string,
        cancelLabel = '',
        size: 's' | 'm' | 'l' = 's',
    ): Observable<boolean> {
        return this.dialogService.open<boolean>(TUI_CONFIRM, {
            label: title,
            size,
            data: {
                content: message,
                yes: confirmLabel,
                no: cancelLabel,
            },
        });
    }
}
