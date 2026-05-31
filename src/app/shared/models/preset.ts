import { BuilderSnapshot } from './snapshot';

export interface Preset {
    id: string;
    name: string;
    state: BuilderSnapshot;
    createdAt: number;
    isSystem?: boolean;
    visibility?: boolean;
}
