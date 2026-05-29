import { ErrorHandler, Injectable, Injector, NgZone, inject } from '@angular/core';
import { TuiNotificationService } from '@taiga-ui/core';
import { BUILDER_DICTIONARY } from '@shared/constants';

@Injectable({
    providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
    private readonly injector = inject(Injector);
    private readonly ngZone = inject(NgZone);

    handleError(error: unknown): void {
        console.error('GlobalErrorHandler caught an error:', error);

        // Using Injector and NgZone because ErrorHandler is instantiated before providers are fully initialized
        // and notifications must run inside the Angular zone.
        const notifications = this.injector.get(TuiNotificationService);

        this.ngZone.run(() => {
            notifications
                .open(BUILDER_DICTIONARY.errors.genericError, {
                    label: BUILDER_DICTIONARY.errors.genericErrorLabel,
                    appearance: 'negative',
                    icon: '@tui.triangle-alert',
                    autoClose: BUILDER_DICTIONARY.timeouts.errorAutoCloseMs,
                })
                .subscribe();
        });
    }
}
