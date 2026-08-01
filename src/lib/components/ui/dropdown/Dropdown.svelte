<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import type { Snippet } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import './dropdown.css';

	interface Props {
		children?: Snippet;
		label?: string;
		trigger?: Snippet<[{ props: Record<string, unknown> }]>;
		open?: boolean;
		side?: 'top' | 'right' | 'bottom' | 'left';
		align?: 'start' | 'center' | 'end';
		side_offset?: number;
		portal?: boolean;
		color?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md';
		disabled?: boolean;
		class?: string;
	}

	let {
		children,
		label,
		trigger,
		open = $bindable(false),
		side = 'bottom',
		align = 'end',
		side_offset = 4,
		portal = true,
		color = 'primary',
		size = 'md',
		disabled = false,
		class: class_list = ''
	}: Props = $props();
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger {disabled}>
		{#snippet child({ props })}
			{#if trigger}
				{@render trigger({ props })}
			{:else}
				<Button {...props} {color} {size}>
					{label}
					<span class="dropdown__chevron" class:dropdown__chevron--open={open}>
						<ChevronDownIcon />
					</span>
				</Button>
			{/if}
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal disabled={!portal}>
		<DropdownMenu.Content {side} {align} sideOffset={side_offset} class="dropdown {class_list}">
			{@render children?.()}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	.dropdown__chevron {
		display: flex;
		transition: rotate 120ms ease;
	}

	.dropdown__chevron :global(svg) {
		width: 1em;
		height: 1em;
	}

	.dropdown__chevron--open {
		rotate: 180deg;
	}

	@media (prefers-reduced-motion) {
		.dropdown__chevron {
			transition: none;
		}
	}
</style>
