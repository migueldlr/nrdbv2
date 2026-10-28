<script lang="ts">
	import Button from '../ui/Button.svelte';

	interface Props {
		on_change_identity: () => void;
	}

	let { on_change_identity }: Props = $props();
</script>

<div class="deck-bar">
	<div class="deck-bar__inner container">
		<h1>Untitled deck</h1>

		<Button color="ghost" size="sm" onclick={on_change_identity}>Change identity</Button>
	</div>
</div>

<style>
	.deck-bar {
		border-bottom: 1px solid var(--border);
		background-color: var(--foreground);
	}

	.deck-bar__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1.25rem;
		padding-block: 0.75rem;
	}

	h1 {
		margin: 0;
		font-size: var(--font-size-xl);
		line-height: var(--leading-tight);
	}
</style>
