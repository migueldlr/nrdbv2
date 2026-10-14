<script lang="ts">
	import { page } from '$app/state';
	import { signIn } from '@auth/sveltekit/client';

	$effect(() => {
		if (page.status === 401) {
			signIn('nsg-keycloak');
		}
	});
</script>

<h1>{page.status}</h1>
<p>{page.error?.message}</p>
