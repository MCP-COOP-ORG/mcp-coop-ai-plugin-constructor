import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CheckboxGroup } from './checkbox-group';
import { RecommendationEngine, BuilderState, TemplateInterpolator, DialogManager } from '@services';
import { ConfigItem } from '@shared/models';

const MOCK_OPTIONS: ConfigItem[] = [
    { id: 'opt1', label: 'Option 1', filePath: 'assets/pages/agents/frontend/opt1.json' },
    { id: 'opt2', label: 'Option 2', filePath: 'assets/pages/agents/frontend/opt2.json', recommendedWith: ['opt1'] },
    { id: 'opt3', label: 'Option 3', filePath: 'assets/pages/agents/backend/opt3.json', discouragedWith: ['opt1'] },
];

describe('CheckboxGroup', () => {
    let component: CheckboxGroup;
    let fixture: ComponentFixture<CheckboxGroup>;
    let mockRecommendationEngine: { getStatus: ReturnType<typeof vi.fn> };
    let mockDialogManager: { openInfoDialog: ReturnType<typeof vi.fn> };
    let mockInterpolator: { fetchJson: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        sessionStorage.clear();

        mockRecommendationEngine = {
            getStatus: vi.fn().mockReturnValue(undefined),
        };

        mockDialogManager = {
            openInfoDialog: vi.fn().mockReturnValue(of(undefined)),
        };

        mockInterpolator = {
            fetchJson: vi.fn().mockResolvedValue({
                description: {
                    default: 'Default description for testing',
                    antigravity: 'Antigravity description for testing',
                },
            }),
        };

        await TestBed.configureTestingModule({
            imports: [CheckboxGroup],
            providers: [
                BuilderState,
                { provide: RecommendationEngine, useValue: mockRecommendationEngine },
                { provide: DialogManager, useValue: mockDialogManager },
                { provide: TemplateInterpolator, useValue: mockInterpolator },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CheckboxGroup);
        fixture.componentRef.setInput('options', MOCK_OPTIONS);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create and execute default callbacks', () => {
        expect(component).toBeTruthy();
        expect(() => component['onChange']([])).not.toThrow();
        expect(() => component['onTouched']()).not.toThrow();
    });

    it('should correctly map array of string values to object boolean map via writeValue', () => {
        component.writeValue(['opt2']);
        expect(component.selectedMap['opt1']).toBe(false);
        expect(component.selectedMap['opt2']).toBe(true);
    });

    it('should emit array of selected IDs on checkbox change', () => {
        let emittedValue: string[] | null = [];
        let touched = false;
        component.registerOnChange((val) => {
            emittedValue = val;
        });
        component.registerOnTouched(() => {
            touched = true;
        });

        // Simulate user checking opt1
        component.selectedMap = { opt1: true, opt2: false, opt3: false };
        component.onCheckboxChange();

        expect(emittedValue).toEqual(['opt1']);
        expect(touched).toBe(true);
    });

    it('should delegate getStatus to RecommendationEngine', () => {
        mockRecommendationEngine.getStatus.mockReturnValue('recommended');
        expect(component.getStatus('opt1')).toBe('recommended');
        expect(mockRecommendationEngine.getStatus).toHaveBeenCalledWith('opt1');
    });

    it('should return discouraged status from RecommendationEngine', () => {
        mockRecommendationEngine.getStatus.mockReturnValue('discouraged');
        expect(component.getStatus('opt3')).toBe('discouraged');
    });

    it('should return undefined for neutral items', () => {
        mockRecommendationEngine.getStatus.mockReturnValue(undefined);
        expect(component.getStatus('opt1')).toBeUndefined();
    });

    it('should call DialogManager.openInfoDialog with correct params on showInfo', async () => {
        const fakeEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event;

        await component.showInfo(fakeEvent, MOCK_OPTIONS[0]);

        expect(fakeEvent.preventDefault).toHaveBeenCalled();
        expect(fakeEvent.stopPropagation).toHaveBeenCalled();
        expect(mockInterpolator.fetchJson).toHaveBeenCalledWith(MOCK_OPTIONS[0].filePath);

        // Wait for the promise to resolve
        await vi.waitFor(() => {
            expect(mockDialogManager.openInfoDialog).toHaveBeenCalledWith(
                'Option 1',
                'Default description for testing',
            );
        });
    });

    it('should handle writeValue with null or undefined gracefully', () => {
        component.writeValue(null);
        expect(Object.keys(component.selectedMap).length).toBe(MOCK_OPTIONS.length);
        expect(Object.values(component.selectedMap).every((v) => v === false)).toBe(true);
    });

    it('should trigger events from template', async () => {
        const checkbox = fixture.nativeElement.querySelector('input[tuiCheckbox]');
        checkbox.click();
        fixture.detectChanges();
        expect(component.selectedMap['opt1']).toBe(true);

        const infoBtn = fixture.nativeElement.querySelector('.checkbox-card__info');
        infoBtn.click();
        fixture.detectChanges();

        // showInfo is async, we need to wait for it
        await fixture.whenStable();
        expect(mockDialogManager.openInfoDialog).toHaveBeenCalled();
    });
});
