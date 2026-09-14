<script lang="ts">
	import type { Review } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Container from '$lib/components/Container.svelte';
	import Meta from '$lib/components/Meta.svelte';

	let { data }: { data: { reviews: Review[] } } = $props();
</script>

<Meta title="Reviews" />

{#if data.reviews}
	<Header title="Reviews" />

	<Container>
		<ul>
			{#each data.reviews as review (review.id)}
				<li>
					<a href={localizeHref(`/reviews/${review.attributes.card_id}`)}>
						{review.attributes.card}
					</a>
				</li>
			{/each}
		</ul>
	</Container>
{/if}

<style>
	/* Temporary styles */
	ul {
		display: grid;
		gap: 1rem;
	}
</style>
