<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { Card } from '$lib/types';
	import RezCost from './RezCost.svelte';
	import { getCardModalStats } from './modal-stats';
	import FormatText from '$lib/components/FormatText.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Influence from '$lib/components/Influence.svelte';
	import { card_types } from '$lib/i18n';

	interface Props {
		card: Card;
	}

	let { card }: Props = $props();

	const attributes = $derived(card.attributes);
	const uses_rez_cost = $derived(
		attributes.card_type_id === 'ice' ||
			attributes.card_type_id === 'asset' ||
			attributes.card_type_id === 'upgrade'
	);
	const stats = $derived(getCardModalStats(attributes));
</script>

<span class="card-modal__watermark" aria-hidden="true">
	<Icon name={attributes.faction_id} size="none" class="card-modal__watermark-icon" />
</span>

<div class="card-modal__details">
	<div class="card-modal__title-row">
		{#if attributes.cost != null}
			<span class="card-modal__cost" aria-hidden="true">
				{#if uses_rez_cost}
					<RezCost class="card-modal__cost-frame" />
				{:else}
					<span class="card-modal__cost-frame card-modal__cost-frame--credit"></span>
				{/if}
				<span class="card-modal__cost-value">{attributes.cost}</span>
			</span>
			<span class="visually-hidden">Cost: {attributes.cost}</span>
		{/if}
		<Dialog.Title class="card-modal__title"
			>{attributes.is_unique ? '◆ ' : ''}{attributes.title}</Dialog.Title
		>
		{#if stats.title}
			<span class="card-modal__title-stat card-modal__stat" aria-hidden="true">
				{stats.title.value}
				{#if stats.title.icon}
					<Icon name={stats.title.icon} size="md" />
				{/if}
			</span>
			<span class="visually-hidden">{stats.title.announcement}</span>
		{/if}
	</div>

	<hr />

	<Dialog.Description class="card-modal__type">
		<strong>{card_types[attributes.card_type_id]}</strong>{attributes.display_subtypes
			? `: ${attributes.display_subtypes}`
			: ''}
	</Dialog.Description>

	{#if attributes.text}
		<hr />
		<div class="card-modal__text">
			<FormatText text={attributes.text} />
		</div>
	{/if}

	<hr />

	<div class="card-modal__footer">
		<span class="card-modal__faction">
			<Icon name={attributes.faction_id} size="md" theme={attributes.faction_id} />
			{#if attributes.influence_cost}
				<Influence count={attributes.influence_cost} total={true} theme={attributes.faction_id} />
			{/if}
		</span>
		{#if stats.footer.length}
			<span class="card-modal__stats">
				{#each stats.footer as stat (stat.announcement)}
					<span class="card-modal__stat" aria-hidden="true">
						{stat.value}
						{#if stat.icon}
							<Icon name={stat.icon} size="sm" />
						{/if}
					</span>
					<span class="visually-hidden">{stat.announcement}</span>
				{/each}
			</span>
		{/if}
	</div>
</div>
