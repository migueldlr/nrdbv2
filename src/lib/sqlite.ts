import { SQLocal } from 'sqlocal';
import { NRDB_SQLITE_NAME, CURRENT_SQLITE_URL_FILENAME } from '$lib/constants';

export const { sql, overwriteDatabaseFile, deleteDatabaseFile } = new SQLocal(NRDB_SQLITE_NAME);

const REQUIRED_TABLES = ['unified_cards', 'card_sets', 'card_cycles', 'card_subtypes'];

export const get_current_sqlite_url = async (): Promise<string | null> => {
	try {
		const root = await navigator.storage.getDirectory();
		const urlHandle = await root.getFileHandle(CURRENT_SQLITE_URL_FILENAME);
		const file = await urlHandle.getFile();
		return await file.text();
	} catch (error) {
		if (error instanceof DOMException && error.name === 'NotFoundError') {
			return null;
		}
		throw error;
	}
};

export const set_current_sqlite_url = async (url: string): Promise<void> => {
	const root = await navigator.storage.getDirectory();
	const urlHandle = await root.getFileHandle(CURRENT_SQLITE_URL_FILENAME, { create: true });
	const writable = await urlHandle.createWritable();
	await writable.write(url);
	await writable.close();
};

export const clear_current_sqlite_url = async (): Promise<void> => {
	const root = await navigator.storage.getDirectory();
	try {
		await root.removeEntry(CURRENT_SQLITE_URL_FILENAME);
	} catch (error) {
		if (!(error instanceof DOMException && error.name === 'NotFoundError')) {
			throw error;
		}
	}
};

export const check_sqlite_db_populated = async (): Promise<boolean> => {
	try {
		const placeholders = REQUIRED_TABLES.map(() => '?').join(', ');
		const rows = await sql(
			`SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${placeholders})`,
			...REQUIRED_TABLES
		);
		return rows.length === REQUIRED_TABLES.length;
	} catch (error) {
		console.error('[SQLITE] Failed to inspect the local database schema:', error);
		return false;
	}
};

export const reset_opfs_data = async (): Promise<void> => {
	try {
		await deleteDatabaseFile();
		await clear_current_sqlite_url();
		console.info('[SQLITE] OPFS database and version marker removed');
	} catch (error) {
		console.error('[SQLITE] Failed to reset OPFS data:', error);
	}

	window.location.reload();
};

export const download_and_extract_sqlite = async (sqlite_url: string): Promise<void> => {
	// Exit immediately if DecompressionStream is not supported, as we won't be able to process the downloaded gzip file.
	if (typeof DecompressionStream === 'undefined') {
		throw new Error('DecompressionStream is not supported in this browser');
	}

	const response = await fetch(sqlite_url);

	if (!response.ok) {
		throw new Error(`Network response failed: ${response.status}`);
	}

	if (!response.body) {
		throw new Error('Response body was empty');
	}

	const decompressedStream = response.body.pipeThrough(new DecompressionStream('gzip'));

	await overwriteDatabaseFile(decompressedStream);
};
