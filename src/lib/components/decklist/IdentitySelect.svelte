<script lang="ts">
	import Button from '../ui/Button.svelte';

	interface Props {
		selected: boolean;
		onselect: () => void;
		class?: string;
	}

	let { selected, onselect, class: class_list = '' }: Props = $props();
</script>

<Button size="sm" class={class_list} color="secondary" disabled={selected} onclick={onselect}>
	{selected ? 'Selected' : 'Select'}
</Button>
