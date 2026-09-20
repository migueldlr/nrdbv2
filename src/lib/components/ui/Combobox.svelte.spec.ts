import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Combobox, {
	type ComboboxItem,
	type ComboboxSearch,
	type ComboboxSearchOptions
} from './Combobox.svelte';

const SURE_GAMBLE = { id: 'sure_gamble', title: 'Sure Gamble' };
const CARNIVORE = { id: 'carnivore', title: 'Carnivore' };
const COOKBOOK = { id: 'cookbook', title: 'Cookbook' };
const CONDUIT = { id: 'conduit', title: 'Conduit' };

const items: ComboboxItem[] = [SURE_GAMBLE, CARNIVORE, COOKBOOK, CONDUIT];

const search_items: ComboboxSearch<ComboboxItem> = (query) =>
	items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

interface RenderOptions {
	value?: ComboboxItem[];
	disabled?: boolean;
	search?: ComboboxSearch<ComboboxItem>;
}

async function render_combobox(options: RenderOptions = {}) {
	const onchange = vi.fn();
	await render(Combobox, {
		value: options.value ?? [],
		disabled: options.disabled,
		onchange,
		search: options.search ?? search_items,
		label: 'Contains cards',
		placeholder: 'Search cards'
	});
	return { onchange };
}

describe('Combobox', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('lists matching items while typing and adds the clicked item to the selection', async () => {
		const { onchange } = await render_combobox();

		const input = page.getByRole('combobox', { name: 'Contains cards' });
		await input.fill('car');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await userEvent.click(page.getByRole('option', { name: 'Carnivore' }));
		expect(onchange).toHaveBeenCalledWith([CARNIVORE]);
		await expect.element(input).toHaveValue('');
	});

	it('moves the highlight with arrow keys and selects with Enter', async () => {
		const { onchange } = await render_combobox();

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('c');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await userEvent.keyboard('{ArrowDown}');
		await expect
			.element(page.getByRole('option', { name: 'Cookbook' }))
			.toHaveAttribute('data-highlighted', '');

		await userEvent.keyboard('{Enter}');
		expect(onchange).toHaveBeenCalledWith([COOKBOOK]);
	});

	it('wraps the highlight around the end of the list', async () => {
		const { onchange } = await render_combobox();

		const input = page.getByRole('combobox', { name: 'Contains cards' });
		await input.hover();
		await input.fill('c');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await userEvent.keyboard('{ArrowUp}');
		await expect
			.element(page.getByRole('option', { name: 'Conduit' }))
			.toHaveAttribute('data-highlighted', '');

		await userEvent.keyboard('{Enter}');
		expect(onchange).toHaveBeenCalledWith([CONDUIT]);
	});

	it('shows the titles of the selected items as chips', async () => {
		await render_combobox({ value: [SURE_GAMBLE, CARNIVORE] });

		await expect.element(page.getByText('Sure Gamble')).toBeVisible();
		await expect.element(page.getByText('Carnivore')).toBeVisible();
	});

	it('removes a chip with its remove button', async () => {
		const { onchange } = await render_combobox({ value: [SURE_GAMBLE, CARNIVORE] });

		await expect.element(page.getByRole('button', { name: 'Remove Carnivore' })).toBeVisible();
		await userEvent.click(page.getByRole('button', { name: 'Remove Carnivore' }));

		expect(onchange).toHaveBeenCalledWith([SURE_GAMBLE]);
	});

	it('removes the last chip with Backspace in the empty input', async () => {
		const { onchange } = await render_combobox({ value: [SURE_GAMBLE, CARNIVORE] });

		const input = page.getByRole('combobox', { name: 'Contains cards' });
		await userEvent.click(input);
		await userEvent.keyboard('{Backspace}');

		expect(onchange).toHaveBeenCalledWith([SURE_GAMBLE]);
	});

	it('closes the listbox with Escape', async () => {
		await render_combobox();

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('car');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await userEvent.keyboard('{Escape}');
		await expect
			.element(page.getByRole('option', { name: 'Carnivore' }))
			.not.toBeInTheDocument();
	});

	it('shows no options when nothing matches', async () => {
		await render_combobox();

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('zzz');
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	});

	it('searches with the configured limit and an abort signal', async () => {
		const search = vi.fn(async () => [CARNIVORE]);
		await render_combobox({ search });

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('car');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		expect(search).toHaveBeenCalledWith(
			'car',
			expect.objectContaining({ limit: 10, signal: expect.any(AbortSignal) })
		);
	});

	it('keeps the previous results visible while a new search is pending', async () => {
		let resolve_search: (found: ComboboxItem[]) => void = () => {};
		const search = (query: string) =>
			query === 'car'
				? Promise.resolve([CARNIVORE])
				: new Promise<ComboboxItem[]>((resolve) => (resolve_search = resolve));

		await render_combobox({ search });
		const input = page.getByRole('combobox', { name: 'Contains cards' });

		await input.fill('car');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await input.fill('cook');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		resolve_search([COOKBOOK]);
		await expect.element(page.getByRole('option', { name: 'Cookbook' })).toBeVisible();
	});

	it('keeps the highlight on the same item when new results replace the list', async () => {
		let resolve_search: (found: ComboboxItem[]) => void = () => {};
		const search = (query: string) =>
			query === 'c'
				? Promise.resolve([CARNIVORE, COOKBOOK])
				: new Promise<ComboboxItem[]>((resolve) => (resolve_search = resolve));

		await render_combobox({ search });
		const input = page.getByRole('combobox', { name: 'Contains cards' });

		await input.fill('c');
		await userEvent.keyboard('{ArrowDown}');
		await expect
			.element(page.getByRole('option', { name: 'Cookbook' }))
			.toHaveAttribute('data-highlighted', '');

		await input.fill('co');
		resolve_search([COOKBOOK, CONDUIT]);
		await expect.element(page.getByRole('option', { name: 'Conduit' })).toBeVisible();

		await expect
			.element(page.getByRole('option', { name: 'Cookbook' }))
			.toHaveAttribute('data-highlighted', '');
		await expect
			.element(page.getByRole('option', { name: 'Conduit' }))
			.not.toHaveAttribute('data-highlighted', '');
	});

	it('shows no options and logs when the search fails', async () => {
		const error_log = vi.spyOn(console, 'error').mockImplementation(() => {});
		await render_combobox({ search: () => Promise.reject(new Error('search is down')) });

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('car');
		await vi.waitFor(() => expect(error_log).toHaveBeenCalled());
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	});

	it('aborts the previous search when the query changes', async () => {
		const signals: AbortSignal[] = [];
		const search = (query: string, options: ComboboxSearchOptions) => {
			signals.push(options.signal);
			return search_items(query, options);
		};

		await render_combobox({ search });
		const input = page.getByRole('combobox', { name: 'Contains cards' });
		await userEvent.click(input);
		await userEvent.keyboard('c');
		await userEvent.keyboard('a');

		await vi.waitFor(() => expect(signals[0]?.aborted).toBe(true));
		expect(signals.at(-1)?.aborted).toBe(false);
	});

	it('disables the input and the chip buttons while disabled', async () => {
		await render_combobox({ value: [CARNIVORE], disabled: true });

		const input = page.getByRole('combobox', { name: 'Contains cards' });
		expect(input.element().hasAttribute('disabled')).toBe(true);

		const remove_button = page.getByRole('button', { name: 'Remove Carnivore' });
		await expect.element(remove_button).toBeVisible();
		expect(remove_button.element().hasAttribute('disabled')).toBe(true);
	});
});
