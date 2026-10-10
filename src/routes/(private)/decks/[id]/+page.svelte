<script lang="ts">
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Container from '$lib/components/Container.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import Breakdown from '$lib/components/decklist/Breakdown.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CardImage from '$lib/components/card/CardImage.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data }: { data: PageData } = $props();

	const identity = $derived(
		data.cards.find((card) => card.id === data.deck.attributes.identity_card_id)
	);
</script>

<Meta title={data.deck.attributes.name} />

<Header title={data.deck.attributes.name}>
	{#snippet actions()}
		<Button color="secondary" href={localizeHref('/decks')}>My decks</Button>
	{/snippet}
</Header>

<Container>
	{#if identity}
		<section class="identity" aria-label="Identity">
			<div class="identity__image">
				<CardImage card={identity} loading="eager" />
			</div>
			<p class="identity__name">
				<span class="identity__faction">
					<Icon name={identity.attributes.faction_id} size="xl" />
				</span>
				{identity.attributes.title}
			</p>
		</section>
	{/if}
	<Breakdown decklist={data.deck} cards={data.cards} />
	{#if data.deck.attributes.notes?.trim()}
		<p class="notes">{data.deck.attributes.notes}</p>
	{/if}
</Container>

<style>
	.identity {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-block-end: 2rem;
	}

	.identity__image {
		display: grid;
		inline-size: 6rem;
		flex-shrink: 0;
	}

	.identity__name {
		display: flex;
		min-inline-size: 0;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		overflow-wrap: anywhere;
	}

	.identity__faction {
		display: flex;
		flex-shrink: 0;
	}

	.notes {
		white-space: pre-line;
	}
</style>
