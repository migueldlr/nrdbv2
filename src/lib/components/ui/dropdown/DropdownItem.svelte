<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		href?: string;
		disabled?: boolean;
		onSelect?: (event: Event) => void;
		class?: string;
		[key: string]: unknown;
	}

	let {
		children,
		href,
		disabled = false,
		onSelect,
		class: class_list = '',
		...rest
	}: Props = $props();
</script>

<DropdownMenu.Item {disabled} {onSelect} {...rest}>
	{#snippet child({ props })}
		{#if href && !disabled}
			<a {...props} {href} class="dropdown__item {class_list}">
				{@render children()}
			</a>
		{:else}
			<div {...props} class="dropdown__item {class_list}">
				{@render children()}
			</div>
		{/if}
	{/snippet}
</DropdownMenu.Item>
