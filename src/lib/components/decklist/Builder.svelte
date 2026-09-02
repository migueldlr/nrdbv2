<script lang="ts">
    import type {
        SidesIds,
        FactionIds,
        CardTypeIds,
        Faction,
        Card as TCard,
        CardGroup,
    } from "$lib/types";
    import { card_types, factions as i18n_factions } from "$lib/i18n";
    import { CARD_TYPES } from "$lib/constants";
    import { group_cards_by_type } from "$lib/utils";
    import Icon from "$lib/components/Icon.svelte";
    import CardImage from "../card/CardImage.svelte";
    import Button from "../ui/Button.svelte";
    import BuilderSearchResults from "./BuilderSearchResults.svelte";
    import Grid from "./Grid.svelte";
    import type { CardSlots } from "./grid";

    interface Props {
        side: SidesIds;
        faction: FactionIds;
        identity: TCard["id"];
        factions: Faction[];
        cards: TCard[];
    }

    let { side, faction, identity, factions, cards }: Props = $props();

    let search_query = $state("");
    let active_tab = $state<
        "Build" | "Notes" | "Check" | "History" | "Collection" | "Settings"
    >("Build");
    let notes_tags = $state("");
    let notes_body = $state("");

    let deck = $derived<{
        readonly identity: TCard["id"];
        readonly cards: Partial<
            Record<CardTypeIds, Record<TCard["id"], number>>
        >;
    }>({
        identity,
        cards: {},
    });

    let factions_list = $derived<Faction[]>(
        factions.filter((f: Faction) => f.attributes.side_id === side),
    );

    let identity_card = $derived<TCard | undefined>(
        cards.find((card: TCard) => card.id === identity),
    );

    let filters = $derived<{
        factions: FactionIds[];
        types: CardTypeIds[];
    }>({
        factions: [identity_card?.attributes.faction_id ?? faction],
        types: [],
    });

    let filtered_cards = $derived<TCard[]>(
        cards.filter(
            (card: TCard) =>
                card.attributes.side_id === side &&
                card.attributes.card_type_id !== `${side}_identity`,
        ),
    );

    let filtered_types = $derived<CardTypeIds[]>(
        side === "corp"
            ? CARD_TYPES.filter(
                  (type) =>
                      ![
                          "event",
                          "hardware",
                          "resource",
                          "program",
                          "runner_identity",
                          "corp_identity",
                      ].includes(type),
              )
            : CARD_TYPES.filter(
                  (type) =>
                      ![
                          "agenda",
                          "asset",
                          "operation",
                          "upgrade",
                          "runner_identity",
                          "corp_identity",
                          "ice",
                      ].includes(type),
              ),
    );

    let grouped_cards = $derived<CardGroup[]>(
        group_cards_by_type(filtered_cards),
    );

    let card_slots = $derived.by<CardSlots>(() => {
        const slots: Record<TCard["id"], number> = {};

        for (const type of filtered_types) {
            Object.assign(slots, deck.cards[type] ?? {});
        }

        return slots;
    });

    let has_selected_cards = $derived(
        grouped_cards.some((group) =>
            group.data.some((card) => (card_slots[card.id] ?? 0) > 0),
        ),
    );

    let results = $derived.by<TCard[]>(() => {
        const query = search_query.trim();

        return filtered_cards.filter((card: TCard) => {
            const title_match =
                query.length === 0 ||
                card.attributes.title
                    .toLowerCase()
                    .includes(query.toLowerCase()) ||
                card.id.toLowerCase().includes(query.toLowerCase());

            const faction_match =
                filters.factions.length === 0 ||
                filters.factions.includes(card.attributes.faction_id);

            const type_match =
                filters.types.length === 0 ||
                filters.types.includes(card.attributes.card_type_id);

            return title_match && faction_match && type_match;
        });
    });

    const toggle_faction = (faction_id: FactionIds) => {
        filters = {
            ...filters,
            factions: filters.factions.includes(faction_id)
                ? filters.factions.filter((value) => value !== faction_id)
                : [...filters.factions, faction_id],
        };
    };

    const toggle_type = (card_type_id: CardTypeIds) => {
        filters = {
            ...filters,
            types: filters.types.includes(card_type_id)
                ? filters.types.filter((value) => value !== card_type_id)
                : [...filters.types, card_type_id],
        };
    };

    const get_quantity = (card: TCard): number =>
        deck.cards[card.attributes.card_type_id]?.[card.id] ?? 0;

    const set_quantity = (card: TCard, quantity: number) => {
        const type_id = card.attributes.card_type_id;
        const cards_for_type = { ...deck.cards[type_id] };

        if (quantity <= 0) {
            delete cards_for_type[card.id];
        } else {
            cards_for_type[card.id] = Math.min(3, quantity);
        }

        deck = {
            identity,
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
            {#if identity_card}
                <p>
                    Decklist for <strong
                        >{identity_card.attributes.title}</strong
                    >
                </p>
                <div style="width: 50%;">
                    <CardImage card={identity_card} />
                </div>
            {/if}

            {#if has_selected_cards}
                <Grid groups={grouped_cards} cardSlots={card_slots} />
            {:else}
                <p class="builder__empty">No cards selected</p>
            {/if}
        </div>
    </div>

    <div class="builder__search">
        <div class="builder__tabs" role="tablist" aria-label="Decklist tabs">
            {#each ["Build", "Notes", "Check", "History", "Collection", "Settings"] as tab (tab)}
                <Button
                    role="tab"
                    color={active_tab === tab ? "primary" : "ghost"}
                    aria-selected={active_tab === tab}
                    onclick={() =>
                        (active_tab = tab as
                            | "Build"
                            | "Notes"
                            | "Check"
                            | "History"
                            | "Collection"
                            | "Settings")}
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
                placeholder="Find a card or filter the list"
                bind:value={search_query}
            />

            <div class="builder__filters">
                <section>
                    <h3>Filter by faction</h3>
                    <div class="builder__chips">
                        {#each factions_list as faction_option (faction_option.id)}
                            <Button
                                color={filters.factions.includes(
                                    faction_option.id,
                                )
                                    ? "primary"
                                    : "ghost"}
                                onclick={() => toggle_faction(faction_option.id)}
                            >
                                <Icon name={faction_option.id} size="sm" />
                                {i18n_factions[faction_option.id]}
                            </Button>
                        {/each}
                    </div>
                </section>

                <section>
                    <h3>Filter by type</h3>
                    <div class="builder__chips">
                        {#each filtered_types as type (type)}
                            <Button
                                color={filters.types.includes(type)
                                    ? "primary"
                                    : "ghost"}
                                onclick={() => toggle_type(type)}
                            >
                                <Icon name={type} size="sm" />
                                {card_types[type]}
                            </Button>
                        {/each}
                    </div>
                </section>
            </div>

            <BuilderSearchResults
                cards={results}
                getQuantity={get_quantity}
                setQuantity={set_quantity}
            />
            {#if results.length === 0}
                <p class="builder__empty">No cards found</p>
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

    .builder__label {
        font-weight: var(--font-weight-semibold);
    }

    .builder__input {
        width: 100%;
    }

    .builder__filters {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .builder__tabs {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    /* .builder__tabs button {
        border: 1px solid var(--border);
        opacity: 0.5;
        background: transparent;
        padding: 0.375rem 0.75rem;
    }

    .builder__tabs button.active {
        opacity: 1;
        border-color: var(--text);
    } */

    .builder__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    /* .builder__chips button {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.5rem;
        border: 1px solid var(--border);
        background: transparent;
        opacity: 0.5;
    }

    .builder__chips button.active {
        background: var(--text);
        color: var(--foreground);
        opacity: 1;
    } */

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

        .builder__filters {
            grid-template-columns: 1fr;
        }
    }
</style>
