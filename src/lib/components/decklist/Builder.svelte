<script lang="ts">
    import type { Card, CardGroup, CardTypeIds } from "$lib/types";
    import { DECK_SEARCH_LIMIT } from "$lib/constants";
    import { group_cards_by_type } from "$lib/utils";
    import {
        searchDeckCards,
        type DeckCardSearchConstraints,
    } from "$lib/search/deck-card-search";
    import { db_ready } from "$lib/store";
    import CardImage from "../card/CardImage.svelte";
    import Button from "../ui/Button.svelte";
    import BuilderSearchResults from "./BuilderSearchResults.svelte";
    import Grid from "./Grid.svelte";
    import type { CardSlots } from "./grid";

    interface Props {
        readonly identity: Card;
        readonly fallbackCards?: readonly Card[];
    }

    interface DeckState {
        readonly cards: Partial<
            Record<CardTypeIds, Record<Card["id"], number>>
        >;
    }

    type DeckSearchStatus =
        | { readonly kind: "idle" }
        | { readonly kind: "searching" }
        | { readonly kind: "error"; readonly message: string }
        | {
              readonly kind: "results";
              readonly count: number;
              readonly truncated: boolean;
          };

    const TABS = [
        "Build",
        "Notes",
        "Check",
        "History",
        "Collection",
        "Settings",
    ] as const satisfies readonly string[];
    type BuilderTab = (typeof TABS)[number];

    const MAX_QUANTITY = 3;

    let { identity, fallbackCards = [] }: Props = $props();

    let search_query = $state("");
    let search_status = $state.raw<DeckSearchStatus>({ kind: "idle" });
    let filtered_cards = $state.raw<Card[] | null>(null);
    let active_tab = $state<BuilderTab>("Build");
    let notes_tags = $state("");
    let notes_body = $state("");
    let deck = $state.raw<DeckState>({
        cards: {},
    });
    let selected_cards = $state.raw<Card[]>([]);
    let search_request_id = 0;

    let side = $derived(identity.attributes.side_id);
    let fallback_side_cards = $derived(
        fallbackCards.filter((card) => card.attributes.side_id === side),
    );
    let has_fallback_cards = $derived(fallback_side_cards.length > 0);
    let can_search = $derived($db_ready || has_fallback_cards);
    let visible_cards = $derived(filtered_cards ?? []);
    let grouped_cards = $derived<CardGroup[]>(
        group_cards_by_type(selected_cards),
    );
    let card_slots = $derived.by<CardSlots>(() => {
        const slots: Record<Card["id"], number> = {};

        for (const cards_for_type of Object.values(deck.cards)) {
            Object.assign(slots, cards_for_type ?? {});
        }

        return slots;
    });
    let has_selected_cards = $derived(
        Object.values(card_slots).some((quantity) => quantity > 0),
    );

    const get_constraints = (): DeckCardSearchConstraints => ({
        sideId: side,
        limit: DECK_SEARCH_LIMIT + 1,
    });

    const is_identity = (card: Card): boolean =>
        card.attributes.card_type_id === "runner_identity" ||
        card.attributes.card_type_id === "corp_identity";

    const show_results = (matches: Card[]) => {
        const deck_card_matches = matches.filter((card) => !is_identity(card));
        const truncated = deck_card_matches.length > DECK_SEARCH_LIMIT;
        const visible = deck_card_matches.slice(0, DECK_SEARCH_LIMIT);

        filtered_cards = visible;
        search_status = { kind: "results", count: visible.length, truncated };
    };

    const run_fallback_search = (query: string) => {
        const normalized_query = query.toLowerCase();

        show_results(
            fallback_side_cards.filter(
                (card) =>
                    normalized_query.length === 0 ||
                    card.attributes.title
                        .toLowerCase()
                        .includes(normalized_query) ||
                    card.id.toLowerCase().includes(normalized_query),
            ),
        );
    };

    const run_search = async (
        query: string,
        request_id: number,
        deck_constraints: DeckCardSearchConstraints,
    ) => {
        try {
            const { cards: results, error } = await searchDeckCards(
                query,
                deck_constraints,
            );

            if (request_id !== search_request_id) return;

            if (error) {
                search_status = {
                    kind: "error",
                    message:
                        error.message ||
                        "The card search could not be completed.",
                };
                return;
            }

            show_results(results);
        } catch (error) {
            if (request_id !== search_request_id) return;

            console.error("Failed to search for deck cards:", error);
            search_status = {
                kind: "error",
                message:
                    "Something went wrong while searching. Please try again.",
            };
        }
    };

    const request_search = (query: string) => {
        const trimmed = query.trim();

        if (!$db_ready) {
            search_request_id += 1;

            if (has_fallback_cards) {
                run_fallback_search(trimmed);
            } else {
                filtered_cards = null;
                search_status = { kind: "idle" };
            }
            return;
        }

        const request_id = ++search_request_id;
        search_status = { kind: "searching" };
        void run_search(trimmed, request_id, get_constraints());
    };

    $effect(() => {
        request_search(search_query);

        return () => {
            search_request_id += 1;
        };
    });

    const get_max_quantity = (_card: Card): number => MAX_QUANTITY;

    const get_quantity = (card: Card): number =>
        deck.cards[card.attributes.card_type_id]?.[card.id] ?? 0;

    const set_quantity = (card: Card, quantity: number) => {
        const type_id = card.attributes.card_type_id;
        const cards_for_type = { ...deck.cards[type_id] };
        const next_quantity = Math.max(
            0,
            Math.min(
                get_max_quantity(card),
                Number.isFinite(quantity) ? Math.trunc(quantity) : 0,
            ),
        );

        if (next_quantity === 0) {
            delete cards_for_type[card.id];
            selected_cards = selected_cards.filter(
                (selected_card) => selected_card.id !== card.id,
            );
        } else {
            cards_for_type[card.id] = next_quantity;

            if (
                !selected_cards.some(
                    (selected_card) => selected_card.id === card.id,
                )
            ) {
                selected_cards = [...selected_cards, card];
            }
        }

        deck = {
            cards: {
                ...deck.cards,
                [type_id]: cards_for_type,
            },
        };
    };
</script>

<div class="builder">
    <div class="builder__summary">
        <div class="builder__summary__sticky">
            <h2>Decklist builder</h2>
            <p>
                Decklist for <strong>{identity.attributes.title}</strong>
            </p>
            <div style="width: 50%;">
                <CardImage card={identity} />
            </div>

            {#if has_selected_cards}
                <Grid groups={grouped_cards} cardSlots={card_slots} />
            {:else}
                <p class="builder__empty">No cards selected</p>
            {/if}
        </div>
    </div>

    <div class="builder__search">
        <div class="builder__tabs" role="tablist" aria-label="Decklist tabs">
            {#each TABS as tab (tab)}
                <Button
                    role="tab"
                    color={active_tab === tab ? "primary" : "ghost"}
                    aria-selected={active_tab === tab}
                    onclick={() => (active_tab = tab)}
                >
                    {tab}
                </Button>
            {/each}
        </div>

        {#if active_tab === "Build"}
            <label class="builder__label" for="deck-search">Find cards</label>
            <input
                id="deck-search"
                class="builder__input"
                type="search"
                placeholder="Describe the cards you want"
                disabled={!can_search}
                bind:value={search_query}
            />

            {#if !can_search}
                <p class="builder__empty" role="status" aria-live="polite">
                    Preparing the card database…
                </p>
            {:else if search_status.kind === "searching"}
                <p class="builder__empty" role="status" aria-live="polite">
                    Searching cards…
                </p>
            {:else if search_status.kind === "error"}
                <p class="builder__error" role="alert">
                    {search_status.message}
                </p>
            {:else if search_status.kind === "results" && search_status.count === 0}
                <p class="builder__empty" role="status" aria-live="polite">
                    No cards found for this search.
                </p>
            {:else if search_status.kind === "results" && search_status.truncated}
                <p role="status" aria-live="polite">
                    Showing the first {search_status.count} matches. Refine your
                    search to narrow the list.
                </p>
            {:else if search_status.kind === "results"}
                <p role="status" aria-live="polite">
                    {search_status.count}
                    {search_status.count === 1 ? "card" : "cards"} found.
                </p>
            {/if}

            {#if can_search && visible_cards.length > 0}
                <BuilderSearchResults
                    cards={visible_cards}
                    getQuantity={get_quantity}
                    getMaxQuantity={get_max_quantity}
                    setQuantity={set_quantity}
                />
            {/if}
        {:else if active_tab === "Notes"}
            <div class="builder__notes">
                <label>
                    <span>Tags</span>
                    <input
                        type="text"
                        class="builder__input"
                        bind:value={notes_tags}
                    />
                </label>
                <small>
                    Tags are for easy filtering in your list of decks, e.g.
                    tournament or glacier.
                </small>
                <label>
                    <span>Notes</span>
                    <textarea class="builder__textarea" bind:value={notes_body}
                    ></textarea>
                </label>
                <div class="builder__notes-preview">Markdown preview here</div>
            </div>
        {:else}
            <p>{active_tab}</p>
        {/if}
    </div>
</div>

<style>
    .builder {
        display: grid;
        gap: 2rem;
        grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    }

    .builder__summary,
    .builder__search {
        display: grid;
        align-content: start;
        gap: 1rem;
    }

    .builder__summary__sticky {
        position: sticky;
        top: 1rem;
    }

    .builder__empty {
        color: var(--text-muted);
    }

    .builder__error {
        color: var(--jinteki);
    }

    .builder__label {
        font-weight: var(--font-weight-semibold);
    }

    .builder__input {
        width: 100%;
    }

    .builder__tabs {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .builder__notes {
        display: grid;
        gap: 0.75rem;
    }

    .builder__notes label {
        display: grid;
        gap: 0.25rem;
    }

    .builder__textarea {
        min-height: 8rem;
        resize: vertical;
    }

    .builder__notes-preview {
        color: var(--text-muted);
    }

    @media (width <= 1024px) {
        .builder {
            grid-template-columns: 1fr;
        }
    }
</style>
