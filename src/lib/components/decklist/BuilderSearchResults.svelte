<script lang="ts">
    import type { Card } from "$lib/types";
    import { card_types, factions as i18n_factions } from "$lib/i18n";
    import Icon from "$lib/components/Icon.svelte";
    import Influence from "$lib/components/Influence.svelte";
    import { tooltip } from "$lib/actions";
    import { localizeHref } from "$lib/paraglide/runtime";
    import Button from "../ui/Button.svelte";

    interface Props {
        readonly cards: readonly Card[];
        readonly getQuantity: (card: Card) => number;
        readonly setQuantity: (card: Card, quantity: number) => void;
    }

    const MAX_QUANTITY = 3;

    let { cards, getQuantity, setQuantity }: Props = $props();

    const increment = (card: Card) => {
        setQuantity(card, getQuantity(card) + 1);
    };

    const decrement = (card: Card) => {
        setQuantity(card, getQuantity(card) - 1);
    };
</script>

<table>
    <thead>
        <tr>
            <th>Qty</th>
            <th>Name</th>
            <th>Type</th>
            <th>Influence</th>
            <th>Faction</th>
            <th>Cost</th>
        </tr>
    </thead>
    <tbody>
        {#each cards as result (result.id)}
            <tr>
                <td>
                    <span class="builder__quantity">
                        <Button
                            size="sm"
                            onclick={() => decrement(result)}>-</Button
                        >
                        <input
                            type="number"
                            min="0"
                            max={MAX_QUANTITY}
                            value={getQuantity(result)}
                            oninput={(event) =>
                                setQuantity(
                                    result,
                                    Number.parseInt(
                                        (
                                            event.currentTarget as HTMLInputElement
                                        ).value,
                                        10,
                                    ) || 0,
                                )}
                        />
                        <Button
                            size="sm"
                            onclick={() => increment(result)}>+</Button
                        >
                    </span>
                </td>
                <td>
                    <a
                        href={localizeHref(`/card/${result.id}`)}
                        use:tooltip={result}
                    >
                        {result.attributes.title}
                    </a>
                </td>
                <td>
                    <Icon
                        name={result.attributes.card_type_id}
                        size="sm"
                    />
                    {card_types[result.attributes.card_type_id]}
                </td>
                <td>
                    {#if result.attributes.influence_cost !== null && result.attributes.influence_cost > 0}
                        <Influence
                            count={result.attributes.influence_cost}
                            theme={result.attributes.faction_id}
                        />
                    {/if}
                </td>
                <td>
                    <Icon name={result.attributes.faction_id} size="sm" />
                    {i18n_factions[result.attributes.faction_id]}
                </td>
                <td>
                    {#if result.attributes.cost !== null}
                        <Icon name="credit" size="sm" />
                        {result.attributes.cost}
                    {:else if result.attributes.memory_cost !== null}
                        <Icon name="mu" size="sm" />
                        {result.attributes.memory_cost}
                    {:else if result.attributes.trash_cost !== null}
                        {result.attributes.trash_cost}
                        <Icon name="trash" size="sm" />
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .builder__quantity {
        display: inline-grid;
        grid-template-columns: auto 3rem auto;
        align-items: center;
        gap: 0.25rem;
    }

    .builder__quantity input {
        width: 100%;
        text-align: center;
    }
</style>
