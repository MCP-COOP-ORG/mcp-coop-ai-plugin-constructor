import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Builder } from './builder';
import { APP_ROUTES, BUILDER_STEPS } from '@shared/constants';
import { GeneratedFile } from '@shared/models';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TuiDialogService, provideTaiga } from '@taiga-ui/core';
import { ArchiveGenerator, PresetManager } from '@services';

describe('Builder', () => {
    let component: Builder;
    let fixture: ComponentFixture<Builder>;
    let router: Router;

    beforeEach(async () => {
        sessionStorage.clear();
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: () => undefined,
                removeListener: () => undefined,
                addEventListener: () => undefined,
                removeEventListener: () => undefined,
                dispatchEvent: () => undefined,
            }),
        });

        await TestBed.configureTestingModule({
            imports: [Builder],
            providers: [
                provideRouter([
                    { path: '**', component: Builder }, // Catch-all route for testing URL changes
                ]),
                provideTaiga(),
                {
                    provide: ArchiveGenerator,
                    useValue: {
                        previewFiles: signal<GeneratedFile[]>([]),
                        downloadArchive: vi.fn(),
                    },
                },
                {
                    provide: PresetManager,
                    useValue: {
                        saveCurrentStateAsPreset: vi.fn(),
                    },
                },
                {
                    provide: TuiDialogService,
                    useValue: { open: vi.fn().mockReturnValue(of({ action: 'download' })) },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(Builder);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should calculate activeStepIndex correctly based on URL', async () => {
        await router.navigateByUrl(`${APP_ROUTES.BUILDER}/${BUILDER_STEPS[2].id}`);
        fixture.detectChanges();
        expect(component.activeStepIndex()).toBe(2);
    });

    describe('nextStep', () => {
        it('should navigate to the next step', async () => {
            await router.navigateByUrl(`${APP_ROUTES.BUILDER}/${BUILDER_STEPS[0].id}`);
            fixture.detectChanges();

            const navigateSpy = vi.spyOn(router, 'navigate');
            component.nextStep();
            expect(navigateSpy).toHaveBeenCalledWith([APP_ROUTES.BUILDER, BUILDER_STEPS[1].id]);
        });

        it('should not navigate if already on the last step', async () => {
            await router.navigateByUrl(`${APP_ROUTES.BUILDER}/${BUILDER_STEPS[BUILDER_STEPS.length - 1].id}`);
            fixture.detectChanges();

            const navigateSpy = vi.spyOn(router, 'navigate');
            component.nextStep();
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });

    describe('prevStep', () => {
        it('should navigate to the previous step', async () => {
            await router.navigateByUrl(`${APP_ROUTES.BUILDER}/${BUILDER_STEPS[1].id}`);
            fixture.detectChanges();

            const navigateSpy = vi.spyOn(router, 'navigate');
            component.prevStep();
            expect(navigateSpy).toHaveBeenCalledWith([APP_ROUTES.BUILDER, BUILDER_STEPS[0].id]);
        });

        it('should not navigate if already on the first step', async () => {
            await router.navigateByUrl(`${APP_ROUTES.BUILDER}/${BUILDER_STEPS[0].id}`);
            fixture.detectChanges();

            const navigateSpy = vi.spyOn(router, 'navigate');
            component.prevStep();
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });

    describe('onStepClick', () => {
        it('should navigate to the requested step index if within highest reached', () => {
            const navigateSpy = vi.spyOn(router, 'navigate');
            component.highestReachedStepIndex.set(3); // Allow navigating up to step 3
            component.onStepClick(2);
            expect(navigateSpy).toHaveBeenCalledWith([APP_ROUTES.BUILDER, BUILDER_STEPS[2].id]);
        });

        it('should not navigate if index is out of bounds', () => {
            const navigateSpy = vi.spyOn(router, 'navigate');
            component.onStepClick(-1);
            component.onStepClick(99);
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });

    describe('download', () => {
        it('should trigger download immediately', async () => {
            const archiveGenerator = TestBed.inject(ArchiveGenerator);
            const downloadSpy = vi.spyOn(archiveGenerator, 'downloadArchive').mockResolvedValue(undefined);

            component.download();

            expect(downloadSpy).toHaveBeenCalledWith(archiveGenerator.previewFiles());
        });
    });

    describe('getPlugin', () => {
        it('should open confirm dialog and trigger download if confirmed', () => {
            const dialogSpy = vi.spyOn(component['dialogManager'], 'openConfirmDialog').mockReturnValue(of(true));
            const downloadSpy = vi.spyOn(component, 'download').mockImplementation(() => undefined);

            component.getPlugin();

            expect(dialogSpy).toHaveBeenCalledWith(
                component.view.getPluginDialog.dialogTitle,
                expect.any(String),
                component.view.getPluginDialog.confirmButton,
                component.view.getPluginDialog.cancelButton,
                'm',
            );
            expect(downloadSpy).toHaveBeenCalled();
        });

        it('should open confirm dialog and not trigger download if cancelled', () => {
            const dialogSpy = vi.spyOn(component['dialogManager'], 'openConfirmDialog').mockReturnValue(of(false));
            const downloadSpy = vi.spyOn(component, 'download').mockImplementation(() => undefined);

            component.getPlugin();

            expect(dialogSpy).toHaveBeenCalled();
            expect(downloadSpy).not.toHaveBeenCalled();
        });
    });

    describe('savePreset', () => {
        it('should open preset dialog', () => {
            const dialogSpy = vi.spyOn(component['dialogManager'], 'openPresetDialog');
            component.savePreset();
            expect(dialogSpy).toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('should call builderState.reset()', () => {
            const stateSpy = vi.spyOn(component['builderState'], 'reset');
            component.reset();
            expect(stateSpy).toHaveBeenCalled();
        });
    });

    describe('Edge cases and boundary conditions', () => {
        it('activeStepIndex should fallback to 0 if url does not match any step', async () => {
            await router.navigateByUrl('/some/unknown/url');
            fixture.detectChanges();
            expect(component.activeStepIndex()).toBe(0);
        });

        it('onStepClick should not navigate if index is exactly the length of steps or negative', () => {
            const navigateSpy = vi.spyOn(router, 'navigate');
            component.onStepClick(component.view.steps.length);
            expect(navigateSpy).not.toHaveBeenCalled();

            component.onStepClick(-1);
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });
});
