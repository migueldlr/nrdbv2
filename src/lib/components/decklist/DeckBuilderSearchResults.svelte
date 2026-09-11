<script lang="ts">
	import type { Card } from '$lib/types';
	import { card_types, factions as i18n_factions } from '$lib/i18n';
	import Icon from '$lib/components/Icon.svelte';
	import Influence from '$lib/components/Influence.svelte';
	import { tooltip } from '$lib/actions';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Button from '../ui/Button.svelte';
	import type { CardSlots } from './card_slots';

	interface Props {
		readonly cards: readonly Card[];
		readonly deck: CardSlots;
		readonly on_open_card: (card: Card) => void;
		readonly on_set_card_quantity: (card: Card, quantity: number) => void;
	}

	let { cards, deck, on_open_card, on_set_card_quantity }: Props = $props();

	const get_quantity = (card: Card): number => deck[card.id] ?? 0;

	const open_card_from_click = (event: MouseEvent, card: Card) => {
		if (
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();
		on_open_card(card);
	};

	const increment = (card: Card) => {
		on_set_card_quantity(card, get_quantity(card) + 1);
	};

	const decrement = (card: Card) => {
		on_set_card_quantity(card, get_quantity(card) - 1);
	};
</script>

<table>
	<thead>
		<tr>
			<th>Qty</th>
			<th>Name</th>
			<th>Type</th>
			<th>Influence</th>
			<th>Faction</th>
			<th>Cost</th>
		</tr>
	</thead>
	<tbody>
		{#each cards as result (result.id)}
			<tr>
				<td>
					<span class="builder__quantity">
						<Button size="sm" onclick={() => decrement(result)}>-</Button>
						<input
							type="number"
							min="0"
							max={result.attributes.deck_limit}
							value={get_quantity(result)}
							oninput={(event) =>
								on_set_card_quantity(
									result,
									Number.parseInt(
										(event.currentTarget as HTMLInputElement).value,
										10
									) || 0
								)}
						/>
						<Button size="sm" onclick={() => increment(result)}>+</Button>
					</span>
				</td>
				<td>
					<a
						href={localizeHref(`/card/${result.id}`)}
						use:tooltip={result}
						aria-haspopup="dialog"
						onclick={(event) => open_card_from_click(event, result)}
					>
						{result.attributes.title}
					</a>
				</td>
				<td class="icon-text">
					<Icon name={result.attributes.card_type_id} size="inline" />
					<span class="truncate">{card_types[result.attributes.card_type_id]}</span>
				</td>
				<td>
					{#if result.attributes.influence_cost !== null && result.attributes.influence_cost > 0}
						<Influence
							count={result.attributes.influence_cost}
							theme={result.attributes.faction_id}
						/>
					{/if}
				</td>
				<td class="icon-text">
					<Icon name={result.attributes.faction_id} size="inline" />
					{i18n_factions[result.attributes.faction_id]}
				</td>
				<td class="icon-text">
					{#if result.attributes.cost !== null}
						<Icon name="credit" size="inline" />
						{result.attributes.cost}
					{:else if result.attributes.memory_cost !== null}
						<Icon name="mu" size="inline" />
						{result.attributes.memory_cost}
					{:else if result.attributes.trash_cost !== null}
						{result.attributes.trash_cost}
						<Icon name="trash" size="inline" />
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.builder__quantity {
		display: inline-grid;
		grid-template-columns: auto 3rem auto;
		align-items: center;
		gap: 0.25rem;
	}

	.builder__quantity input {
		width: 100%;
		text-align: center;
	}
</style>
