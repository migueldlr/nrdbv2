import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sqlMock } = vi.hoisted(() => ({ sqlMock: vi.fn() }));
vi.mock('$lib/sqlite', () => ({ sql: sqlMock }));

import { searchCardTitles } from './titles';

describe('searchCardTitles', () => {
	beforeEach(() => {
		sqlMock.mockReset();
		sqlMock.mockResolvedValue([]);
	});

	it('matches anywhere in the title, ranks prefix matches first and returns the rows', async () => {
		sqlMock.mockResolvedValue([{ id: 'sure_gamble', title: 'Sure Gamble' }]);

		const found = await searchCardTitles('sure', 3);

		expect(found).toEqual([{ id: 'sure_gamble', title: 'Sure Gamble' }]);
		expect(sqlMock).toHaveBeenCalledWith(
			expect.stringContaining('ORDER BY stripped_title LIKE ?'),
			'%sure%',
			'sure%',
			3
		);
	});

	it.each([
		['strips case, accents and whitespace', '  Señor  ', '%senor%'],
		['escapes LIKE wildcards', '100%_\\', '%100\\%\\_\\\\%'],
		['does not treat the input as search syntax', 't:ice', '%t:ice%']
	])('%s', async (_, query, pattern) => {
		await searchCardTitles(query, 5);
		expect(sqlMock.mock.calls[0][1]).toBe(pattern);
	});

	it('skips the database for a blank query', async () => {
		expect(await searchCardTitles(' ', 3)).toEqual([]);
		expect(sqlMock).not.toHaveBeenCalled();
	});
});
