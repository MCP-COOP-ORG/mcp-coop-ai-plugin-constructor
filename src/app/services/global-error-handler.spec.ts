import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error-handler';
import { TuiNotificationService } from '@taiga-ui/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('GlobalErrorHandler', () => {
    let service: GlobalErrorHandler;
    let notificationServiceMock: {
        open: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        notificationServiceMock = {
            open: vi.fn().mockReturnValue(of({})),
        };

        TestBed.configureTestingModule({
            providers: [GlobalErrorHandler, { provide: TuiNotificationService, useValue: notificationServiceMock }],
        });
        service = TestBed.inject(GlobalErrorHandler);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle error by logging and opening notification', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const mockError = new Error('Test Error');

        service.handleError(mockError);

        expect(consoleSpy).toHaveBeenCalledWith('GlobalErrorHandler caught an error:', mockError);
        expect(notificationServiceMock.open).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
