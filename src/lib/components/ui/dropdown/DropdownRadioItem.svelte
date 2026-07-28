<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		value: string;
		disabled?: boolean;
		class?: string;
		[key: string]: unknown;
	}

	let {
		children: label,
		value,
		disabled = false,
		class: class_list = '',
		...rest
	}: Props = $props();
</script>

<DropdownMenu.RadioItem {value} {disabled} class="dropdown__item {class_list}" {...rest}>
	{#snippet children({ checked })}
		<span class="dropdown__indicator" aria-hidden="true">
			{#if checked}
				<CheckIcon />
			{/if}
		</span>
		{@render label()}
	{/snippet}
</DropdownMenu.RadioItem>
