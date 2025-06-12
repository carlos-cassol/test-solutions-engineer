export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	rootDir: '.',
	testMatch: ['<rootDir>/test/**/*.spec.ts'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	transform: { '^.+\\.ts$': 'ts-jest' },
};
