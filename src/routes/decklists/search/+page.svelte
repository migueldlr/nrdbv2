<script lang="ts">
	import DecklistTiles from '$lib/components/decklist/Tiles.svelte';
	import { FACTIONS, NRDB_API_URL } from '$lib/constants';
	import { faction_name } from '$lib/i18n';
	import type { Decklist } from '$lib/types';

	let search_results = $state<Decklist[]>([]);
	let is_searching = $state<boolean>(false);
	let has_searched = $state<boolean>(false);
	let search_error = $state<string | null>(null);

	const search = async (event: Event) => {
		event.preventDefault();

		const form_data = new FormData(event.target as HTMLFormElement);
		const parameters = new URLSearchParams();
		parameters.set('page[size]', '20');
		parameters.set('sort', '-created_at');

		const faction = form_data.get('faction');
		if (faction) parameters.set('filter[faction_id]', String(faction));

		const author = form_data.get('author');
		if (author) parameters.set('filter[user_id][match]', String(author));

		const title = form_data.get('title');
		if (title) parameters.set('filter[name][match]', String(title));

		is_searching = true;
		search_error = null;

		try {
			const response = await fetch(`${NRDB_API_URL}/decklists?` + parameters.toString());
			if (!response.ok) throw new Error(`NetrunnerDB returned ${response.status}.`);

			const json = await response.json();
			search_results = json.data;
		} catch (error) {
			search_results = [];
			search_error = error instanceof Error ? error.message : 'Search failed.';
		} finally {
			is_searching = false;
			has_searched = true;
		}
	};
</script>

<form class="fields" onsubmit={search}>
	<div class="field">
		<label for="faction">Faction</label>
		<select name="faction" id="faction">
			<option value="">Ignore</option>
			{#each FACTIONS as faction_id (faction_id)}
				<option value={faction_id}>{faction_name(faction_id)}</option>
			{/each}
		</select>
	</div>

	<div class="field">
		<label for="author">Author name</label>
		<input type="text" name="author" id="author" placeholder="Enter author name" />
	</div>

	<div class="field">
		<label for="title">Decklist name</label>
		<input type="text" name="title" id="title" placeholder="Enter decklist name" />
	</div>

	<button type="submit" disabled={is_searching}>Search</button>
</form>

<h2>Search Results</h2>
<section class="search-results">
	{#if search_error}
		<p role="alert">{search_error}</p>
	{:else if is_searching}
		<div>Searching...</div>
	{:else if search_results.length > 0}
		<DecklistTiles tiles={search_results.map((decklist) => ({ decklist }))} />
	{:else if has_searched}
		<div class="no-results">No decklists found matching your criteria.</div>
	{/if}
</section>

<style>
	.fields {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.75rem;
	}

	.field {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.field input {
		box-sizing: border-box;
		width: 10rem;
	}
</style>
