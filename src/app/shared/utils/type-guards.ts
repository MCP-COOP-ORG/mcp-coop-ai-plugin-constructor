import { NavigationEnd } from '@angular/router';

export function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

export function isNavigationEnd(event: unknown): event is NavigationEnd {
    return event instanceof NavigationEnd;
}
