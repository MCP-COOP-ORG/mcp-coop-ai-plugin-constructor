import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DialogManager } from './dialog-manager';
import { TuiDialogService } from '@taiga-ui/core';
import { of } from 'rxjs';

describe('DialogManager', () => {
    let service: DialogManager;
    let dialogService: TuiDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DialogManager,
                {
                    provide: TuiDialogService,
                    useValue: { open: vi.fn().mockReturnValue(of({})) },
                },
            ],
        });

        service = TestBed.inject(DialogManager);
        dialogService = TestBed.inject(TuiDialogService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should open preset dialog', async () => {
        vi.spyOn(dialogService, 'open').mockReturnValue(of({}));
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        service.openPresetDialog();
        await vi.waitFor(() => {
            expect(dialogService.open).toHaveBeenCalled();
        });
        consoleSpy.mockRestore();
    });

    it('should open info dialog with correct params', () => {
        const spy = vi.spyOn(dialogService, 'open').mockReturnValue(of(undefined));
        service.openInfoDialog('Title', 'Content', 'l');
        expect(spy).toHaveBeenCalledWith('Content', {
            label: 'Title',
            size: 'l',
        });
    });

    it('should open confirm dialog with correct params including cancelLabel and default size', () => {
        const spy = vi.spyOn(dialogService, 'open').mockReturnValue(of(true));
        service.openConfirmDialog('Confirm Title', 'Confirm Message', 'ConfirmBtn', 'CancelBtn');
        expect(spy).toHaveBeenCalledWith(expect.any(Object), {
            label: 'Confirm Title',
            size: 's',
            data: {
                content: 'Confirm Message',
                yes: 'ConfirmBtn',
                no: 'CancelBtn',
            },
        });
    });

    it('should open confirm dialog with custom size', () => {
        const spy = vi.spyOn(dialogService, 'open').mockReturnValue(of(true));
        service.openConfirmDialog('Confirm Title', 'Confirm Message', 'ConfirmBtn', 'CancelBtn', 'm');
        expect(spy).toHaveBeenCalledWith(expect.any(Object), {
            label: 'Confirm Title',
            size: 'm',
            data: {
                content: 'Confirm Message',
                yes: 'ConfirmBtn',
                no: 'CancelBtn',
            },
        });
    });
});
