<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		value?: string;
		label?: string;
		class?: string;
	}

	let { children, value = $bindable(), label, class: class_list = '' }: Props = $props();
</script>

<DropdownMenu.RadioGroup bind:value class="dropdown__group {class_list}">
	{#if label}
		<DropdownMenu.GroupHeading class="dropdown__heading">{label}</DropdownMenu.GroupHeading>
	{/if}
	{@render children()}
</DropdownMenu.RadioGroup>
