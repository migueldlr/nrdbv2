<script lang="ts">
	import CardModal from '$lib/components/card/Modal.svelte';
	import type { Card } from '$lib/types';

	interface Props {
		card: Card;
		open?: boolean;
	}

	let { card, open: initial_open = true }: Props = $props();
	let open = $state(true);

	$effect(() => {
		open = initial_open;
	});

	const handle_open_change = (value: boolean): void => {
		open = value;
	};
</script>

{#if !open}
	<button type="button" onclick={() => (open = true)}>Open modal</button>
{/if}

<CardModal {card} {open} onOpenChange={handle_open_change} />
