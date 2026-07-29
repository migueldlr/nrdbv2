import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { handle as authHandle } from './auth';

// Handle to set appropriate headers to allow OPFS usage (mainly for SQLite WASM).
// See https://sqlite.org/wasm/doc/trunk/persistence.md#coop-coep
export const opfsHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	return response;
};

// creating a handle to use the paraglide middleware
const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', locale);
			}
		});
	});

export const handle: Handle = sequence(opfsHandle, authHandle, paraglideHandle);
