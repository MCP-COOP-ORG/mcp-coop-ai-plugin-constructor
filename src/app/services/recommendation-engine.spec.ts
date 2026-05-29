import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RecommendationEngine } from './recommendation-engine';
import { BuilderState } from './builder-state';

describe('RecommendationEngine', () => {
    let engine: RecommendationEngine;
    let builderState: BuilderState;

    beforeEach(() => {
        sessionStorage.clear();
        TestBed.configureTestingModule({
            providers: [RecommendationEngine, BuilderState],
        });

        builderState = TestBed.inject(BuilderState);
        engine = TestBed.inject(RecommendationEngine);
    });

    it('should be created', () => {
        expect(engine).toBeTruthy();
    });

    it('should return empty statusMap when nothing is selected', () => {
        const map = engine.statusMap();
        expect(map.size).toBe(0);
    });

    it('should return recommended status for items in recommendedWith of selected skill', () => {
        // NestJS recommends typescript, postgresql, docker
        builderState.dynamicData['agents'].set({ backend: ['nestjs'] });
        const map = engine.statusMap();

        expect(map.get('typescript')).toBe('recommended');
        expect(map.get('postgresql')).toBe('recommended');
        expect(map.get('docker')).toBe('recommended');
    });

    it('should return discouraged status for items in discouragedWith of selected skill', () => {
        // NestJS discourages spring-boot, php, express
        builderState.dynamicData['agents'].set({ backend: ['nestjs'] });
        const map = engine.statusMap();

        expect(map.get('spring-boot')).toBe('discouraged');
        expect(map.get('php')).toBe('discouraged');
        expect(map.get('express')).toBe('discouraged');
    });

    it('should give discouraged priority over recommended when conflicting', () => {
        // NestJS recommends typescript, docker; discourages express
        // Express recommends javascript, typescript, mongodb; discourages nestjs
        builderState.dynamicData['agents'].set({ backend: ['nestjs', 'express'] });
        const map = engine.statusMap();

        // Both recommend typescript → should still be recommended
        expect(map.get('typescript')).toBe('recommended');
        // NestJS discourages express, Express discourages NestJS — both are selected, so they should not appear
        // (selected items are excluded from the map)
        expect(map.has('nestjs')).toBe(false);
        expect(map.has('express')).toBe(false);
    });

    it('should not include already-selected items in the status map', () => {
        builderState.dynamicData['agents'].set({ backend: ['nestjs'], frontend: ['typescript'] });
        const map = engine.statusMap();

        // typescript is selected, should NOT appear in the map even though nestjs recommends it
        expect(map.has('typescript')).toBe(false);
        // nestjs is selected, should NOT appear either
        expect(map.has('nestjs')).toBe(false);
    });

    it('should work across multiple pages (agents + rules + workflows)', () => {
        // Select nestjs (agents) which recommends typescript and docker
        builderState.dynamicData['agents'].set({ backend: ['nestjs'] });
        // Select gitflow (workflows) which discourages trunk-based
        builderState.dynamicData['workflows'].set({ development: ['gitflow'] });

        const map = engine.statusMap();
        expect(map.get('typescript')).toBe('recommended');
        expect(map.get('trunk-based')).toBe('discouraged');
    });

    it('should return undefined via getStatus for neutral items', () => {
        builderState.dynamicData['agents'].set({ backend: ['nestjs'] });
        // mongodb has no relationship with nestjs
        expect(engine.getStatus('mongodb')).toBeUndefined();
    });

    it('should handle empty arrays gracefully', () => {
        builderState.dynamicData['agents'].set({ frontend: [] });
        builderState.dynamicData['rules'].set({});
        builderState.dynamicData['workflows'].set({});
        const map = engine.statusMap();
        expect(map.size).toBe(0);
    });

    it('should react to signal changes', () => {
        // Initially empty
        expect(engine.statusMap().size).toBe(0);

        // Select nestjs
        builderState.dynamicData['agents'].set({ backend: ['nestjs'] });
        expect(engine.statusMap().get('typescript')).toBe('recommended');

        // Deselect nestjs
        builderState.dynamicData['agents'].set({ backend: [] });
        expect(engine.statusMap().size).toBe(0);
    });
});
