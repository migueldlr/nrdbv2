<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		label?: string;
		class?: string;
	}

	let { children, label, class: class_list = '' }: Props = $props();
</script>

<DropdownMenu.Group class="dropdown__group {class_list}">
	{#if label}
		<DropdownMenu.GroupHeading class="dropdown__heading">{label}</DropdownMenu.GroupHeading>
	{/if}
	{@render children()}
</DropdownMenu.Group>
