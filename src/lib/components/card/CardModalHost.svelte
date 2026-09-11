<script lang="ts">
	import { page } from '$app/state';
	import { card_modal, close_card_modal } from '$lib/store';
	import Modal from './Modal.svelte';

	$effect(() => {
		const current_url = page.url.href;
		return () => close_card_modal();
	});
</script>

{#if $card_modal}
	<Modal
		card={$card_modal.card}
		open
		onOpenChange={() => close_card_modal()}
	/>
{/if}
