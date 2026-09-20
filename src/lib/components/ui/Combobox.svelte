<script lang="ts" module>
	export interface ComboboxItem {
		id: string;
		title: string;
	}

	export interface ComboboxSearchOptions {
		signal: AbortSignal;
		limit: number;
	}

	export type ComboboxSearch<T extends ComboboxItem = ComboboxItem> = (
		query: string,
		options: ComboboxSearchOptions
	) => T[] | Promise<T[]>;
</script>

<script lang="ts" generics="T extends ComboboxItem">
	import XIcon from '@lucide/svelte/icons/x';

	interface Props {
		value: T[];
		onchange: (value: T[]) => void;
		search: ComboboxSearch<T>;
		label: string;
		placeholder?: string;
		disabled?: boolean;
		maxResults?: number;
	}

	let {
		value,
		onchange,
		search,
		label,
		placeholder = 'Search...',
		disabled = false,
		maxResults = 10
	}: Props = $props();

	let query = $state('');
	let isOpen = $state(false);
	let highlightedId = $state<string | null>(null);
	let results = $state<T[]>([]);
	let inputElement = $state<HTMLInputElement | null>(null);
	let rootElement = $state<HTMLDivElement | null>(null);

	const listboxId = $props.id();

	const hasQuery = $derived(query.trim().length > 0);

	const candidates = $derived(
		results.filter((item) => !value.some((selected) => selected.id === item.id))
	);

	const highlightedIndex = $derived.by(() => {
		const index = candidates.findIndex((item) => item.id === highlightedId);
		if (index !== -1) return index;
		return candidates.length > 0 ? 0 : -1;
	});

	const activeOptionId = $derived(candidates[highlightedIndex]?.id);

	const isListboxVisible = $derived(isOpen && hasQuery && candidates.length > 0);

	function getOptionId(itemId: string): string {
		return `${listboxId}-option-${itemId}`;
	}

	$effect(() => {
		const text = query.trim();

		if (!text) {
			results = [];
			return;
		}

		const controller = new AbortController();

		void (async () => {
			try {
				const found = await search(text, { signal: controller.signal, limit: maxResults });
				if (controller.signal.aborted) return;
				results = found;
			} catch (error) {
				if (controller.signal.aborted) return;
				console.error('[COMBOBOX] Search failed:', error);
				results = [];
			}
		})();

		return () => controller.abort();
	});

	$effect(() => {
		if (isListboxVisible && activeOptionId) scrollOptionIntoView(activeOptionId);
	});

	function scrollOptionIntoView(optionId: string) {
		document.getElementById(getOptionId(optionId))?.scrollIntoView({ block: 'nearest' });
	}

	function selectItem(item: T) {
		if (disabled) return;
		if (!value.some((selected) => selected.id === item.id)) onchange([...value, item]);
		query = '';
		highlightedId = null;
		inputElement?.focus();
	}

	function removeItem(itemId: string) {
		onchange(value.filter((selected) => selected.id !== itemId));
		inputElement?.focus();
	}

	function moveHighlight(offset: number) {
		if (candidates.length === 0) return;
		const next = (highlightedIndex + offset + candidates.length) % candidates.length;
		highlightedId = candidates[next]?.id ?? null;
	}

	function openListboxAt(index: number) {
		isOpen = true;
		highlightedId = candidates[Math.max(index, 0)]?.id ?? null;
	}

	function selectHighlightedItem(event: KeyboardEvent) {
		const item = candidates[highlightedIndex];
		if (!isOpen || !item) return;
		event.preventDefault();
		selectItem(item);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (isOpen) moveHighlight(1);
			else openListboxAt(0);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (isOpen) moveHighlight(-1);
			else openListboxAt(candidates.length - 1);
		} else if (event.key === 'Enter') {
			selectHighlightedItem(event);
		} else if (event.key === 'Escape') {
			if (isOpen) {
				event.preventDefault();
				isOpen = false;
			}
		} else if (event.key === 'Backspace' && query === '' && value.length > 0) {
			removeItem(value[value.length - 1].id);
		}
	}

	function closeOnFocusout(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (next && rootElement?.contains(next)) return;
		isOpen = false;
	}
</script>

<div
	class="combobox"
	class:combobox--disabled={disabled}
	bind:this={rootElement}
	onfocusout={closeOnFocusout}
>
	<div class="combobox__field">
		<input
			bind:this={inputElement}
			class="combobox__input"
			type="text"
			role="combobox"
			aria-expanded={isListboxVisible}
			aria-controls={isListboxVisible ? listboxId : undefined}
			aria-autocomplete="list"
			aria-activedescendant={isListboxVisible && activeOptionId
				? getOptionId(activeOptionId)
				: undefined}
			aria-label={label}
			placeholder={value.length === 0 ? placeholder : ''}
			bind:value={query}
			{disabled}
			onfocus={() => (isOpen = true)}
			oninput={() => (isOpen = true)}
			onkeydown={handleKeydown}
		/>

		{#each value as item (item.id)}
			<span class="chip">
				<span class="chip__label">{item.title}</span>
				<button
					type="button"
					class="chip__remove"
					aria-label={`Remove ${item.title}`}
					{disabled}
					onclick={() => removeItem(item.id)}
				>
					<XIcon size={12} />
				</button>
			</span>
		{/each}
	</div>

	{#if isListboxVisible}
		<ul
			class="combobox__listbox"
			id={listboxId}
			role="listbox"
			aria-label={`${label} results`}
			aria-multiselectable="true"
		>
			{#each candidates as item, index (item.id)}
				<li
					id={getOptionId(item.id)}
					class="combobox__option"
					class:combobox__option--highlighted={index === highlightedIndex}
					role="option"
					aria-selected="false"
					data-highlighted={index === highlightedIndex ? '' : undefined}
					onmousedown={(event) => {
						event.preventDefault();
						selectItem(item);
					}}
					onmouseenter={() => (highlightedId = item.id)}
				>
					{item.title}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.combobox {
		position: relative;
		width: 100%;
	}

	.combobox__field {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
		box-sizing: border-box;
		min-height: 2.25rem;
		padding: 0.25rem;
		background: var(--foreground);
		border: 1px solid var(--border);
	}

	.combobox__field:focus-within {
		border-color: var(--text);
	}

	.combobox--disabled .combobox__field {
		opacity: 0.5;
	}

	/* chips render before the input, but the input stays first in the DOM so Tab reaches it first */
	.combobox__input {
		order: 2;
		flex: 1 1 8rem;
		min-width: 8rem;
		padding: 0.125rem 0.25rem;
		color: var(--text);
		background: transparent;
		border: none;
		font-family: inherit;
		font-size: var(--font-size-sm);
		outline: none;
	}

	.combobox__input::placeholder {
		color: var(--text-muted);
	}

	.chip {
		order: 1;
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
		max-width: 100%;
		padding: 0.125rem 0.125rem 0.125rem 0.375rem;
		background: var(--background);
		border: 1px solid var(--border);
		color: var(--text);
		font-size: var(--font-size-sm);
	}

	.chip__label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chip__remove {
		display: grid;
		place-items: center;
		padding: 0.125rem;
		color: var(--text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.chip__remove:hover {
		color: var(--text);
	}

	.chip__remove:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 1px;
	}

	.combobox__listbox {
		position: absolute;
		top: calc(100% + 2px);
		left: 0;
		right: 0;
		z-index: 50;
		max-height: 15rem;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		list-style: none;
		background: var(--foreground);
		border: 1px solid var(--border);
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.2);
	}

	.combobox__option {
		padding: 0.375rem 0.5rem;
		color: var(--text);
		font-size: var(--font-size-sm);
		cursor: pointer;
	}

	.combobox__option--highlighted {
		background: var(--text);
		color: var(--background);
	}
</style>
