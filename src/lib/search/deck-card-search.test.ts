import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SURE_GAMBLE } from '$lib/cards.fixture';

const { adaptCardMock, sqlMock } = vi.hoisted(() => ({
	adaptCardMock: vi.fn(),
	sqlMock: vi.fn()
}));

vi.mock('$lib/adapter', () => ({ adaptCard: adaptCardMock }));
vi.mock('$lib/sqlite', () => ({ sql: sqlMock }));

import { searchDeckCards } from './deck-card-search';

describe('searchDeckCards', () => {
	beforeEach(() => {
		adaptCardMock.mockReset();
		sqlMock.mockReset();
	});

	it('runs a limited blank search for the side and adapts its rows', async () => {
		const row = { id: 'row-1' };
		sqlMock.mockResolvedValue([row]);
		adaptCardMock.mockReturnValue(SURE_GAMBLE);

		const result = await searchDeckCards('', { sideId: 'runner', limit: 101 });

		expect(sqlMock).toHaveBeenCalledWith(
			'SELECT * FROM unified_cards WHERE unified_cards.side_id = ? ORDER BY title ASC LIMIT ?',
			'runner',
			101
		);
		expect(adaptCardMock.mock.calls[0][0]).toBe(row);
		expect(result).toEqual({ cards: [SURE_GAMBLE], error: null });
	});

	it('returns invalid expressions without querying SQLite', async () => {
		const result = await searchDeckCards('zzz:foo', { sideId: 'runner' });

		expect(result.cards).toEqual([]);
		expect(result.error).toBeInstanceOf(Error);
		expect(sqlMock).not.toHaveBeenCalled();
		expect(adaptCardMock).not.toHaveBeenCalled();
	});
});
