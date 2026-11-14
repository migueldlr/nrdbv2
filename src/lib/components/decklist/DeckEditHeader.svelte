<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Card } from '$lib/types';
	import DeckHeader from './DeckHeader.svelte';
	import { UNTITLED_DECK } from '$lib/decks';

	interface Props {
		name: string;
		identity: Card;
		actions?: Snippet;
	}

	let { name = $bindable(), identity, actions }: Props = $props();
</script>

<DeckHeader {identity} name={name || UNTITLED_DECK} compact {actions}>
	{#snippet title()}
		<input
			class="deck-edit-header__name"
			type="text"
			aria-label="Deck name"
			placeholder={UNTITLED_DECK}
			autocomplete="off"
			maxlength="255"
			bind:value={name}
		/>
	{/snippet}
</DeckHeader>

<style>
	.deck-edit-header__name {
		box-sizing: border-box;
		inline-size: 100%;
		margin: 0;
		padding: 0.125rem 0.25rem;
		margin-inline-start: -0.25rem;
		border: 1px solid transparent;
		border-radius: 0.25rem;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	.deck-edit-header__name:hover {
		border-color: var(--border);
	}

	.deck-edit-header__name:focus-visible {
		border-color: currentColor;
		outline: none;
	}

	.deck-edit-header__name::placeholder {
		color: var(--text-muted);
		opacity: 1;
	}
</style>
