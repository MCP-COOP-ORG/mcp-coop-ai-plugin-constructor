import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reportsDirectory: 'coverage/mcp-coop-agent-builder',
            reporter: ['text', 'html'],
            exclude: ['node_modules/**', 'src/main.ts', '**/*.spec.ts', '**/*.html'],
            thresholds: {
                lines: 85,
                statements: 85,
                functions: 85,
                branches: 85,
            },
        },
    },
});
