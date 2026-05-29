import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTaiga } from '@taiga-ui/core';
import { App } from './app';
import { vi } from 'vitest';
import { WritableSignal } from '@angular/core';

// Taiga UI's dark mode token requires matchMedia which jsdom does not provide
beforeAll(() => {
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
            dispatchEvent: () => false,
        }),
    });
});

describe('App', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App],
            providers: [provideRouter([]), provideTaiga()],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should render app-header in the template', () => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const header = fixture.nativeElement.querySelector('app-header');
        expect(header).toBeTruthy();
    });

    it('should initialize with dark mode if localStorage is set to dark', () => {
        const themeKey = 'theme';
        localStorage.setItem(themeKey, 'dark');

        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        const appInstance = app as unknown as { darkMode: WritableSignal<boolean> };

        expect(appInstance.darkMode()).toBe(true);
        localStorage.removeItem(themeKey);
    });

    it('should sync darkMode signal changes back to localStorage', () => {
        const themeKey = 'theme';
        localStorage.removeItem(themeKey);

        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        const appInstance = app as unknown as { darkMode: WritableSignal<boolean> };

        // Trigger effect to save dark theme
        appInstance.darkMode.set(true);
        TestBed.flushEffects();
        expect(localStorage.getItem(themeKey)).toBe('dark');

        // Trigger effect to save light theme
        appInstance.darkMode.set(false);
        TestBed.flushEffects();
        expect(localStorage.getItem(themeKey)).toBe('light');

        localStorage.removeItem(themeKey);
    });

    it('should handle localStorage access errors gracefully', () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'theme') {
                throw new Error('Security Error');
            }
            return null;
        });

        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        const appInstance = app as unknown as { darkMode: WritableSignal<boolean> };

        expect(appInstance.darkMode()).toBe(false);
        getItemSpy.mockRestore();
    });
});
