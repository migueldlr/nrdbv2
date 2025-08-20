<script lang="ts">
	import { store } from '$lib/store.svelte';
</script>

{#if store.allCards.length === 0}
	<p>Loading all cards...</p>
{:else}
	<ul>
		{#each store.allCards as card}
			<li>
				{card.attributes.title}
			</li>
		{/each}
	</ul>
{/if}
