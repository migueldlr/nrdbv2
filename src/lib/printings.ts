import { adaptPrinting } from './adapter';
import { sql } from './sqlite';
import type { Printing } from './api.types';
import type { UnifiedPrintingRow } from './sqlite.types';

export async function getPrintingById(id: string): Promise<Printing | null> {
	const rows = (await sql(
		'SELECT * FROM unified_printings WHERE id = ? LIMIT 1',
		id
	)) as UnifiedPrintingRow[];

	return rows[0] ? adaptPrinting(rows[0]) : null;
}
