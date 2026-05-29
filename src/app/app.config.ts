import { provideTaiga } from '@taiga-ui/core';
import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './services/global-error-handler';

const SW_REGISTRATION_TIMEOUT_MS = 30000;

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideTaiga(),
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        provideServiceWorker('ngsw-worker.js', {
            // TODO: Enable PWA when app releases become stable/infrequent
            enabled: false, // !isDevMode(),
            registrationStrategy: 'registerWhenStable:' + SW_REGISTRATION_TIMEOUT_MS,
        }),
    ],
};
