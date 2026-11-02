import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Combobox, { type ComboboxItem, type ComboboxSearch } from './Combobox.svelte';

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
	const { rerender } = await render(Combobox, {
		value: options.value ?? [],
		disabled: options.disabled,
		onchange,
		search: options.search ?? search_items,
		label: 'Contains cards',
		placeholder: 'Search cards'
	});
	return { onchange, rerender };
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

	it('moves the highlight with arrow keys, wraps around the ends and selects with Enter', async () => {
		const { onchange } = await render_combobox();

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('c');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await userEvent.keyboard('{ArrowDown}');
		await expect
			.element(page.getByRole('option', { name: 'Cookbook' }))
			.toHaveAttribute('data-highlighted', '');

		await userEvent.keyboard('{ArrowUp}{ArrowUp}');
		await expect
			.element(page.getByRole('option', { name: 'Conduit' }))
			.toHaveAttribute('data-highlighted', '');

		await userEvent.keyboard('{Enter}');
		expect(onchange).toHaveBeenCalledWith([CONDUIT]);
	});

	it('shows selected items as chips and removes one with its remove button', async () => {
		const { onchange } = await render_combobox({ value: [SURE_GAMBLE, CARNIVORE] });

		await expect.element(page.getByText('Sure Gamble')).toBeVisible();
		await expect.element(page.getByText('Carnivore')).toBeVisible();
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

	it('shows no options when nothing matches', async () => {
		await render_combobox();

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('zzz');
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
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

	it('searches with the configured limit and ignores a slower earlier response', async () => {
		let resolve_first: (found: ComboboxItem[]) => void = () => {};
		const limits: number[] = [];
		const search = (query: string, limit: number) => {
			limits.push(limit);
			return query === 'c'
				? new Promise<ComboboxItem[]>((resolve) => (resolve_first = resolve))
				: Promise.resolve([CARNIVORE]);
		};

		await render_combobox({ search });
		const input = page.getByRole('combobox', { name: 'Contains cards' });
		await input.fill('c');
		await input.fill('car');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		resolve_first([COOKBOOK]);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await expect
			.element(page.getByRole('option', { name: 'Cookbook' }))
			.not.toBeInTheDocument();
		expect(limits).toEqual([10, 10]);
	});

	it('reopens the results when the input is clicked after Escape', async () => {
		await render_combobox();

		const input = page.getByRole('combobox', { name: 'Contains cards' });
		await input.fill('car');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await userEvent.keyboard('{Escape}');
		await expect
			.element(page.getByRole('option', { name: 'Carnivore' }))
			.not.toBeInTheDocument();

		await userEvent.click(input);
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();
	});

	it('keeps focus in the input when pressing inside the listbox', async () => {
		await render_combobox();

		const input = page.getByRole('combobox', { name: 'Contains cards' });
		await input.fill('car');
		const listbox = page.getByRole('listbox');
		await expect.element(listbox).toBeVisible();

		const pressed = listbox
			.element()
			.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		expect(pressed).toBe(false);
	});

	it('does not search again when only the search function changes', async () => {
		const { rerender } = await render_combobox();

		await page.getByRole('combobox', { name: 'Contains cards' }).fill('car');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		const next_search = vi.fn(search_items);
		await rerender({ search: next_search });
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();
		expect(next_search).not.toHaveBeenCalled();
	});

	it('hides the results and disables the input and chip buttons when disabled', async () => {
		const { rerender } = await render_combobox({ value: [SURE_GAMBLE] });

		const input = page.getByRole('combobox', { name: 'Contains cards' });
		await input.fill('car');
		await expect.element(page.getByRole('option', { name: 'Carnivore' })).toBeVisible();

		await rerender({ disabled: true });
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		await expect.element(input).toBeDisabled();
		await expect
			.element(page.getByRole('button', { name: 'Remove Sure Gamble' }))
			.toBeDisabled();
	});
});
