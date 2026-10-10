<script lang="ts">
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Container from '$lib/components/Container.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import Tiles from '$lib/components/decklist/Tiles.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data }: { data: PageData } = $props();
</script>

<Meta title="My decks" />

<Header title="My decks">
	{#snippet actions()}
		<Button href={localizeHref('/decklist/create')}>Build a deck</Button>
	{/snippet}
</Header>

<Container>
	{#if data.tiles.length === 0}
		<p class="empty">You have no decks yet.</p>
	{:else}
		<Tiles tiles={data.tiles} />
	{/if}
</Container>

<style>
	.empty {
		margin: 0;
		padding-block: 3rem;
	}
</style>
