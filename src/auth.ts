import { SvelteKitAuth } from '@auth/sveltekit';
import { createAuthCallbacks } from '$lib/server/auth_callbacks';
import {
	AUTH_KEYCLOAK_ISSUER,
	AUTH_CLIENT_NAME,
	AUTH_CLIENT_ID,
	AUTH_SECRET
} from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	providers: [
		{
			id: AUTH_CLIENT_NAME,
			name: 'Null Signal Games',
			type: 'oidc',
			issuer: AUTH_KEYCLOAK_ISSUER,
			clientId: AUTH_CLIENT_ID,
			clientSecret: AUTH_SECRET
		}
	],
	callbacks: createAuthCallbacks({
		issuer: AUTH_KEYCLOAK_ISSUER,
		clientId: AUTH_CLIENT_ID,
		clientSecret: AUTH_SECRET
	})
});
