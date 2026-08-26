<script lang="ts">
	import { Dialog } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Card } from '$lib/types';
	import CardImage from './CardImage.svelte';
	import FormatText from '$lib/components/FormatText.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Influence from '$lib/components/Influence.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { card_types } from '$lib/i18n';
	import { localizeHref } from '$lib/paraglide/runtime';
	import './card-modal.css';

	interface Props {
		card: Card;
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { card, open, onOpenChange }: Props = $props();

	const attributes = $derived(card.attributes);
	const cost = $derived(attributes.cost);
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay class="card-modal__overlay" />
		<Dialog.Content
			class="card-modal"
			data-id="card-modal"
			style="--faction: var(--{attributes.faction_id}); --faction-contrast: var(--{attributes.faction_id}-contrast)"
		>
			<div class="card-modal__art">
				<CardImage {card} loading="eager" href={null} />
			</div>

			<div class="card-modal__info">
				<span class="card-modal__watermark" aria-hidden="true">
					<Icon
						name={attributes.faction_id}
						size="none"
						class="card-modal__watermark-icon"
					/>
				</span>

				<div class="card-modal__details">
					<div class="card-modal__title-row">
						{#if cost != null}
							<span class="card-modal__cost" aria-hidden="true">
								<span class="card-modal__cost-frame card-modal__cost-frame--credit"></span>
								<span class="card-modal__cost-value">{cost}</span>
							</span>
							<span class="visually-hidden">Cost: {cost}</span>
						{/if}
						<Dialog.Title class="card-modal__title"
							>{attributes.is_unique ? '◆ ' : ''}{attributes.title}</Dialog.Title
						>
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

					<span class="card-modal__faction">
						<Icon
							name={attributes.faction_id}
							size="md"
							theme={attributes.faction_id}
						/>
						{#if attributes.influence_cost}
							<Influence
								count={attributes.influence_cost}
								total={true}
								theme={attributes.faction_id}
							/>
						{/if}
					</span>
				</div>

				<Dialog.Close class="card-modal__close">
					<XIcon size={16} />
					<span class="visually-hidden">Close</span>
				</Dialog.Close>
			</div>

			<div class="card-modal__actions">
				<Button color="secondary" href={localizeHref(`/decklists/search?cards[]=${card.id}`)}>
					Decklists with this card
				</Button>
				<Button href={localizeHref(`/card/${card.id}`)}>
					View full card page
				</Button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
