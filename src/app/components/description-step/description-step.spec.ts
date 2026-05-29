import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DescriptionStep } from './description-step';
import { BuilderState, PresetManager } from '@services';
import { vi } from 'vitest';

describe('DescriptionStep', () => {
    let component: DescriptionStep;
    let fixture: ComponentFixture<DescriptionStep>;
    let builderState: BuilderState;

    beforeEach(async () => {
        sessionStorage.clear();
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, DescriptionStep],
            providers: [BuilderState],
        }).compileComponents();

        fixture = TestBed.createComponent(DescriptionStep);
        component = fixture.componentInstance;
        builderState = TestBed.inject(BuilderState);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form from builder state', () => {
        builderState.descriptionData.set({ projectIdentity: { name: 'Test Project' } });

        // Re-init
        fixture = TestBed.createComponent(DescriptionStep);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const projectIdentity = component.form.get('projectIdentity');
        expect(projectIdentity?.get('name')?.value).toBe('Test Project');
    });

    it('should update builder state on form changes', async () => {
        component.form.patchValue({ projectIdentity: { name: 'New Name' } });
        await new Promise((resolve) => setTimeout(resolve, 350));
        const data = builderState.descriptionData();
        const projectIdentity = data['projectIdentity'] as Record<string, unknown>;
        expect(projectIdentity['name']).toBe('New Name');
    });

    it('should handle top-level textarea blocks', () => {
        // Override view to include a top-level textarea
        const customBlock = {
            id: 'topText',
            title: 'Top Text',
            icon: 'icon',
            type: 'textarea' as const,
        };

        // We can't easily change the view after initialization because form is already built
        // But we can create a new instance with mocked data
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, DescriptionStep],
            providers: [BuilderState],
        });
        const newFixture = TestBed.createComponent(DescriptionStep);
        const newComponent = newFixture.componentInstance;
        Object.defineProperty(newComponent, 'view', {
            get: () => ({
                blocksArray: [customBlock],
                step: { id: 'test', label: 'test', icon: 'test', title: 'test', description: 'test' },
                dictionary: { limits: { textarea: 1000 } },
            }),
        });
        Object.defineProperty(newComponent, 'blocksArray', { value: () => [customBlock] });
        newFixture.detectChanges();

        expect(newComponent.form.get('topText')?.value).toBe('');
    });

    it('should handle composite blocks with different field types', () => {
        const customBlock = {
            id: 'comp1',
            title: 'Comp 1',
            icon: 'i',
            type: 'composite' as const,
            fields: [
                { id: 'f1', type: 'input' as const, label: 'L1' },
                { id: 'f2', type: 'textarea' as const, label: 'L2' },
                { id: 'f3', type: 'multi-select' as const, label: 'L3', options: [{ id: 'o1', label: 'O1' }] },
            ],
        };

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, DescriptionStep],
            providers: [BuilderState],
        });
        const newFixture = TestBed.createComponent(DescriptionStep);
        const newComponent = newFixture.componentInstance;
        Object.defineProperty(newComponent, 'view', {
            get: () => ({
                blocksArray: [customBlock],
                step: { id: 'test', label: 'test', icon: 'test', title: 'test', description: 'test' },
                dictionary: { limits: { textarea: 1000 } },
            }),
        });
        Object.defineProperty(newComponent, 'blocksArray', { value: () => [customBlock] });
        newFixture.detectChanges();

        const group = newComponent.form.get('comp1');
        expect(group?.get('f1')).toBeTruthy();
        expect(group?.get('f2')).toBeTruthy();
        expect(group?.get('f3')).toBeTruthy();
    });

    it('should load preset when preset field changes', () => {
        const mockPresetManager = { loadPreset: vi.fn(), presets: vi.fn().mockReturnValue([]) };
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, DescriptionStep],
            providers: [BuilderState, { provide: PresetManager, useValue: mockPresetManager }],
        });
        const newFixture = TestBed.createComponent(DescriptionStep);
        const newComponent = newFixture.componentInstance;
        Object.defineProperty(newComponent, 'view', {
            get: () => ({
                blocksArray: [
                    {
                        id: 'projectIdentity',
                        type: 'composite',
                        fields: [{ id: 'preset', type: 'select' }],
                    },
                ],
                step: { id: 'test', label: 'test', icon: 'test', title: 'test', description: 'test' },
                dictionary: { limits: { textarea: 1000 } },
            }),
        });
        Object.defineProperty(newComponent, 'blocksArray', { value: () => [] });
        newFixture.detectChanges();

        const presetControl = newComponent.form.get('projectIdentity.preset');
        presetControl?.setValue('preset-123');

        expect(mockPresetManager.loadPreset).toHaveBeenCalledWith('preset-123');
    });
});
