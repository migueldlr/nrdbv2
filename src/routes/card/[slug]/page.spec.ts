import { describe, it, expect } from 'vitest';
import { createMockCard } from '$lib/test-helpers';

const mockCards = [
	createMockCard('1', 'Test Card One', ['core'], {
		latest_printing_images: {
			nrdb_classic: {
				tiny: '',
				small: '',
				medium: '',
				large: 'large-image-url'
			}
		}
	}),
	createMockCard('2', 'Another Test Card', ['elevation'], {
		latest_printing_id: 'p2',
		latest_printing_images: {
			nrdb_classic: {
				tiny: '',
				small: '',
				medium: '',
				large: 'another-large-url'
			}
		}
	})
];

describe('Card Page Logic', () => {
	it('should find card by id correctly', () => {
		const card = mockCards.find((card) => card.id === '1');
		expect(card?.attributes.title).toBe('Test Card One');
	});

	it('should return undefined for non-existent card', () => {
		const card = mockCards.find((card) => card.id === 'nonexistent');
		expect(card).toBeUndefined();
	});
});

// Component testing is handled by E2E tests due to SvelteKit context requirements
