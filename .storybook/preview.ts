import type { Decorator, Preview } from '@storybook/sveltekit';

import '../src/app.css';

const with_theme: Decorator = (story, context) => {
	const { theme } = context.globals;

	if (theme === 'auto') {
		document.documentElement.removeAttribute('data-theme');
	} else {
		document.documentElement.setAttribute('data-theme', theme);
	}

	return story();
};

const preview: Preview = {
	decorators: [with_theme],
	globalTypes: {
		theme: {
			description: 'Color scheme applied to the preview',
			toolbar: {
				title: 'Theme',
				icon: 'contrast',
				items: [
					{ value: 'auto', title: 'Auto', icon: 'browser' },
					{ value: 'light', title: 'Light', icon: 'sun' },
					{ value: 'dark', title: 'Dark', icon: 'moon' }
				],
				dynamicTitle: true
			}
		}
	},
	initialGlobals: {
		theme: 'light'
	},
	parameters: {
		controls: {
			matchers: {
				color: /(background|[a-z]Color)$/,
				date: /Date$/i
			}
		}
	}
};

export default preview;
