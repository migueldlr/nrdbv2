<script lang="ts" module>
    export interface ToggleOption<T extends string = string> {
        value: T;
        label: string;
        color?: string;
    }
</script>

<script lang="ts" generics="T extends string">
    import { type Snippet } from "svelte";

    interface BaseProps {
        options: ToggleOption<T>[];
        label: string;
        size?: "sm" | "md";
        icon_only?: boolean;
        option?: Snippet<[ToggleOption<T>]>;
    }

    interface SingleProps extends BaseProps {
        multiple?: false;
        selected: T | null;
        onselect: (value: T) => void;
    }

    interface MultipleProps extends BaseProps {
        multiple: true;
        selection: T[];
        ontoggle: (values: T[]) => void;
    }

    type Props = SingleProps | MultipleProps;

    let props: Props = $props();

    let {
        options,
        label,
        size = "md",
        icon_only = false,
        option,
    } = $derived(props);

    const is_on = (value: T): boolean =>
        props.multiple ? props.selection.includes(value) : props.selected === value;

    const activate = (value: T) => {
        if (!props.multiple) {
            props.onselect(value);
            return;
        }

        props.ontoggle(
            props.selection.includes(value)
                ? props.selection.filter((entry) => entry !== value)
                : [...props.selection, value],
        );
    };
</script>

<div class="toggle-group" role="group" aria-label={label}>
    {#each options as {value, label, color} (value)}
        <button
            type="button"
            class="toggle"
            class:toggle--on={is_on(value)}
            class:toggle--sm={size === "sm"}
            class:toggle--icon={icon_only}
            style={color
                ? `--color: ${color}`
                : undefined}
            aria-pressed={is_on(value)}
            title={icon_only ? label : undefined}
            aria-label={icon_only ? label : undefined}
            onclick={() => activate(value)}
        >
            {#if option}
                {@render option({value, label, color})}
            {:else}
                {label}
            {/if}
        </button>
    {/each}
</div>

<style>
    .toggle-group {
        display: inline-flex;
    }


    .toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-sizing: border-box;
        min-height: 2.25rem;
        padding: 0.375rem 1rem;
        font-family: inherit;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        line-height: var(--leading-tight);
        color: var(--text-muted);
        background: transparent;
        border: 1px solid var(--border);
        cursor: pointer;
        transition:
            background-color 120ms ease,
            border-color 120ms ease,
            color 120ms ease;

        &:hover {
            color: var(--text);
        }

        &:focus-visible {
            outline: 2px solid var(--text);
            outline-offset: 2px;
        }

        &.toggle--sm {
            min-height: 2rem;
            padding: 0.25rem 0.75rem;
        }

        &.toggle--on {
            color: var(--text);
            background: color-mix(
                in srgb,
                var(--color, var(--text)) 15%,
                transparent
            );
        }

        &.toggle--icon {
            padding: 0.375rem 0.5rem;
            color: var(--color, var(--text-muted));
        }
    }


    @media (prefers-reduced-motion) {
        .toggle {
            transition: none;
        }
    }

    .toggle-group .toggle + .toggle {
        border-left: none;
    }
</style>
