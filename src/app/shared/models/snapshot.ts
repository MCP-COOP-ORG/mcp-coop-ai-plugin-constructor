export interface ProjectIdentityState {
    name?: string;
    domains?: string[];
    description?: string;
    preset?: string;
}

export interface DescriptionState {
    projectIdentity?: ProjectIdentityState;
    [key: string]: unknown;
}

export interface ReviewState {
    aiAgent?: string;
    [key: string]: unknown;
}

/**
 * Represents a Memento (snapshot) of the BuilderState at a given point in time.
 */
export interface BuilderSnapshot {
    description?: DescriptionState;
    review?: ReviewState;
    editedFiles?: Record<string, string>;
    [dynamicKey: string]: Record<string, unknown> | Record<string, string> | undefined;
}
