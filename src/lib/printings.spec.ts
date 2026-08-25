import { beforeEach, describe, expect, it, vi } from 'vitest';

const { adaptPrintingMock, sqlMock } = vi.hoisted(() => ({
	adaptPrintingMock: vi.fn(),
	sqlMock: vi.fn()
}));

vi.mock('./adapter', () => ({ adaptPrinting: adaptPrintingMock }));
vi.mock('./sqlite', () => ({ sql: sqlMock }));

import { getPrintingById } from './printings';

describe('getPrintingById', () => {
	beforeEach(() => {
		adaptPrintingMock.mockReset();
		sqlMock.mockReset();
	});

	it('loads and adapts a printing by ID', async () => {
		const row = { id: '30030' };
		const printing = { id: '30030' };
		sqlMock.mockResolvedValue([row]);
		adaptPrintingMock.mockReturnValue(printing);

		await expect(getPrintingById('30030')).resolves.toBe(printing);
		expect(sqlMock).toHaveBeenCalledWith(
			'SELECT * FROM unified_printings WHERE id = ? LIMIT 1',
			'30030'
		);
		expect(adaptPrintingMock).toHaveBeenCalledWith(row);
	});

	it('returns null when the printing is unavailable', async () => {
		sqlMock.mockResolvedValue([]);

		await expect(getPrintingById('missing')).resolves.toBeNull();
		expect(adaptPrintingMock).not.toHaveBeenCalled();
	});
});
