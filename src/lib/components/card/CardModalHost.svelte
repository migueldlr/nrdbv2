<script lang="ts">
	import { page } from '$app/state';
	import { card_modal, close_card_modal } from '$lib/store';
	import Modal from './Modal.svelte';

	$effect(() => {
		const current_url = page.url.href;
		return () => close_card_modal();
	});

	$effect(() => {
		const request = $card_modal;
		if (!request?.on_card_key_down) return;

		const on_key_down = request.on_card_key_down;
		window.addEventListener('keydown', on_key_down);
		return () => window.removeEventListener('keydown', on_key_down);
	});
</script>

{#if $card_modal}
	<Modal
		card={$card_modal.card}
		open
		onOpenChange={() => close_card_modal()}
		actions={$card_modal.actions}
	/>
{/if}
