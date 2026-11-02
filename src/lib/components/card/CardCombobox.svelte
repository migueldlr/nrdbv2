<script lang="ts">
	import { Combobox, type ComboboxItem } from '$lib/components/ui/combobox';
	import { searchCardTitles } from '$lib/search/titles';
	import { db_ready } from '$lib/store';

	interface Props {
		value: ComboboxItem[];
		onchange: (value: ComboboxItem[]) => void;
		label: string;
		placeholder?: string;
		disabled?: boolean;
	}

	let {
		value,
		onchange,
		label,
		placeholder = 'Add cards...',
		disabled = false
	}: Props = $props();
</script>

<Combobox
	{value}
	{onchange}
	search={searchCardTitles}
	{label}
	placeholder={$db_ready ? placeholder : 'Loading cards...'}
	disabled={disabled || !$db_ready}
/>
