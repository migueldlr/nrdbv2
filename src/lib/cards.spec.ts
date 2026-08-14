import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Card } from './api.types';
import type { UnifiedCardRow } from './sqlite.types';

const { adaptCardMock, sqlMock } = vi.hoisted(() => ({
	adaptCardMock: vi.fn(),
	sqlMock: vi.fn()
}));

vi.mock('./adapter', () => ({ adaptCard: adaptCardMock }));
vi.mock('./sqlite', () => ({ sql: sqlMock }));

import { getCardsByIds } from './cards';

describe('getCardsByIds', () => {
	beforeEach(() => {
		adaptCardMock.mockReset();
		sqlMock.mockReset();
	});

	it('does not query the database when no IDs are provided', async () => {
		await expect(getCardsByIds([])).resolves.toEqual([]);
		expect(sqlMock).not.toHaveBeenCalled();
	});

	it('loads and adapts cards for the provided IDs', async () => {
		const rows = [{ id: 'one' }, { id: 'two' }] as UnifiedCardRow[];
		const cards = [{ id: 'one' }, { id: 'two' }] as Card[];
		sqlMock.mockResolvedValue(rows);
		adaptCardMock.mockReturnValueOnce(cards[0]).mockReturnValueOnce(cards[1]);

		await expect(getCardsByIds(['one', 'two'])).resolves.toEqual(cards);

		expect(sqlMock).toHaveBeenCalledWith(
			'SELECT * FROM unified_cards WHERE id IN (?, ?)',
			'one',
			'two'
		);
		expect(adaptCardMock.mock.calls.map(([row]) => row)).toEqual(rows);
	});
});
