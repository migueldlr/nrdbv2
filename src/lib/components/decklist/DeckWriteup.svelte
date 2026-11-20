<script lang="ts">
	interface Props {
		html: string;
	}

	let { html }: Props = $props();
</script>

<section class="writeup" aria-label="Writeup">
	<div class="writeup__body">
		{@html html}
	</div>
</section>

<style>
	.writeup {
		min-inline-size: 0;
		padding: var(--space-6) var(--space-8);
		background: var(--foreground);
		border: 1px solid var(--border);
	}
</style>
