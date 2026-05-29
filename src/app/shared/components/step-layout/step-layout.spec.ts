import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepLayout } from './step-layout';
import { Component } from '@angular/core';
import { BUILDER_STEPS } from '@shared/constants';
import { BuilderBlockConfig } from '@shared/models';
import { vi } from 'vitest';

@Component({
    template: ` <app-step-layout [step]="step" [blocks]="blocks"> </app-step-layout> `,
    imports: [StepLayout],
})
class TestHostComponent {
    step = BUILDER_STEPS[0];
    blocks: BuilderBlockConfig[] = [
        { id: 'block1', title: 'Block 1', icon: '@tui.box', type: 'radio', options: [] },
        { id: 'block2', title: 'Block 2', icon: '@tui.box', type: 'radio', options: [] },
    ];
}

describe('StepLayout', () => {
    let component: StepLayout;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        // Mock IntersectionObserver
        class MockIntersectionObserver {
            constructor(public callback: IntersectionObserverCallback) {}
            observe() {
                return undefined;
            }
            disconnect() {
                return undefined;
            }
        }
        window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        // Getting reference to the child component
        component = fixture.debugElement.children[0].componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should compute tabs correctly', () => {
        expect(component.tabs().length).toBe(2);
        expect(component.tabs()[0].id).toBe('block1');
    });

    it('should scroll to block', () => {
        // Mock the blockElements signal to return a dummy element
        const mockElement = { nativeElement: { scrollIntoView: vi.fn() } };
        vi.spyOn(component, 'blockElements').mockReturnValue([mockElement, mockElement] as unknown as never);

        component.scrollToBlock(1);

        expect(component.activeTabIndex()).toBe(1);
        expect(mockElement.nativeElement.scrollIntoView).toHaveBeenCalled();
    });

    it('should handle intersection observer callback', () => {
        // We can simulate the callback if we spy on it, but the simplest way is to call it directly
        // since we mocked IntersectionObserver. However, the logic is encapsulated.
        // Let's just trigger the private method logic
        const setupScrollSpy = component['setupScrollSpy'].bind(component);

        let observerCallback: IntersectionObserverCallback | undefined;
        class FakeIntersectionObserver {
            constructor(cb: IntersectionObserverCallback) {
                observerCallback = cb;
            }
            observe() {
                return undefined;
            }
            disconnect() {
                return undefined;
            }
        }
        window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

        setupScrollSpy();

        if (observerCallback) {
            observerCallback(
                [{ isIntersecting: true, target: { id: 'block2' } } as IntersectionObserverEntry],
                {} as IntersectionObserver,
            );
            expect(component.activeTabIndex()).toBe(1);

            // Test when isIntersecting is false (no tab change)
            component.activeTabIndex.set(0);
            observerCallback(
                [{ isIntersecting: false, target: { id: 'block2' } } as IntersectionObserverEntry],
                {} as IntersectionObserver,
            );
            expect(component.activeTabIndex()).toBe(0);

            // Test when id is not found
            observerCallback(
                [{ isIntersecting: true, target: { id: 'unknown-block' } } as IntersectionObserverEntry],
                {} as IntersectionObserver,
            );
            expect(component.activeTabIndex()).toBe(0);
        }
    });

    it('should not throw when scrollToBlock is called with an invalid index', () => {
        // blockElements returns array of 2 elements, calling with index 5 should do nothing safely
        const mockElement = { nativeElement: { scrollIntoView: vi.fn() } };
        vi.spyOn(component, 'blockElements').mockReturnValue([mockElement, mockElement] as unknown as never);

        component.scrollToBlock(5);

        expect(component.activeTabIndex()).toBe(5); // It sets index but shouldn't throw or scroll
        expect(mockElement.nativeElement.scrollIntoView).not.toHaveBeenCalled();
    });
});
