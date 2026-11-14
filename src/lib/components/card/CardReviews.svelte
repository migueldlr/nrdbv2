<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { Review as ReviewData } from '$lib/types';
	import Review from '$lib/components/review/Item.svelte';

	interface Props {
		reviews: Promise<ReviewData[]>;
	}

	let { reviews }: Props = $props();
</script>

{#await reviews}
	Loading reviews...
{:then reviews}
	<section class="card-section">
		<h2>{m.reviews()}</h2>
		{#if reviews.length > 0}
			<div class="reviews">
				{#each reviews as review (review.id)}
					<Review {review} />
				{/each}
			</div>
		{:else}
			<p>No reviews yet.</p>
		{/if}
	</section>
{:catch error}
	<p>error loading reviews: {error.message}</p>
{/await}

<style>
	.card-section {
		padding: 1.5rem;
		background-color: var(--foreground);
		border: 1px solid var(--border);
	}

	h2 {
		margin: 0 0 1rem;
		font-size: var(--font-size-xl);
	}

	.reviews {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	@media (max-width: 640px) {
		.card-section {
			padding: 1.25rem;
		}
	}
</style>
