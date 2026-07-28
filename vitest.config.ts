import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			expect: { requireAssertions: true },
			coverage: {
				provider: 'v8',
				reporter: ['text', 'html', 'lcov'],
				reportsDirectory: './coverage',
				include: ['src/**/*.{ts,js,svelte}'],
				exclude: [
					'src/**/*.{test,spec}.{ts,js}',
					'src/**/*.stories.{ts,js,svelte}',
					'src/**/*.d.ts'
				]
			},
			projects: [
				{
					extends: './vite.config.ts',
					test: {
						name: 'client',
						browser: {
							enabled: true,
							provider: 'playwright',
							instances: [
								{
									browser: 'chromium'
								}
							]
						},
						include: [
							'src/**/*.svelte.{test,spec}.{js,ts}',
							'src/**/*.browser.{test,spec}.{js,ts}'
						],
						exclude: ['src/lib/server/**'],
						setupFiles: ['./vitest-setup-client.ts']
					}
				},
				{
					extends: './vite.config.ts',
					test: {
						name: 'server',
						environment: 'node',
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: [
							'src/**/*.svelte.{test,spec}.{js,ts}',
							'src/**/*.browser.{test,spec}.{js,ts}'
						]
					}
				},
				{
					extends: './vite.config.ts',
					plugins: [
						svelte({
							include: [/\.svelte$/, /node_modules\/@storybook\/.*\.svelte$/]
						}),
						storybookTest({ configDir: '.storybook' })
					],
					test: {
						name: 'storybook',
						browser: {
							enabled: true,
							headless: true,
							provider: 'playwright',
							instances: [{ browser: 'chromium' }]
						},
						setupFiles: ['./.storybook/vitest.setup.ts']
					}
				}
			]
		}
	})
);
