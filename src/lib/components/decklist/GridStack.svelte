<script lang="ts">
	import CardImage from '$lib/components/card/CardImage.svelte';
	import type { Card } from '$lib/types';

	interface Props {
		readonly card: Card;
		readonly copies: number;
	}

	let { card, copies }: Props = $props();
</script>

<span class="deck-grid-stack" aria-hidden="true">
	{#each Array.from({ length: copies }) as _, copyIndex (`${card.id}-${copyIndex}`)}
		<span
			class="deck-grid-stack__copy"
			style:--rotation-index={Math.min(copies - copyIndex - 1, 5)}
			style:--stack-index={copyIndex + 1}
		>
			<CardImage {card} href={null} />
		</span>
	{/each}
</span>

<style>
	.deck-grid-stack {
		position: relative;
		display: block;
		inline-size: 100%;
		aspect-ratio: 0.718 / 1;
	}

	.deck-grid-stack__copy {
		position: absolute;
		inset: 0;
		z-index: var(--stack-index);
		display: block;
		transform: rotate(calc(var(--rotation-index) * -2.5deg));
		transform-origin: left bottom;
		pointer-events: none;
	}
</style>
