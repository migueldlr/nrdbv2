<script lang="ts">
    import { getGhostRemainder, getWordRangeAtCursor } from "$lib/search/ghost";

    let {
        value = $bindable(""),
        onFocus,
        onBlur,
        inputElement = $bindable(null)
    }: {
        value?: string;
        onFocus?: () => void;
        onBlur?: (event: FocusEvent) => void;
        inputElement?: HTMLInputElement | null;
    } = $props();

    let caret = $state(0);
    let collapsed = $state(true);
    let scrollLeft = $state(0);

    const wordEnd = $derived(
        collapsed ? getWordRangeAtCursor(value, caret).end : -1
    );

    const typed = $derived(value.slice(0, wordEnd));
    const remainder = $derived(
        wordEnd === value.length ? getGhostRemainder(value, caret) : ""
    );

    function syncCaret() {
        if (!inputElement) return;
        caret = inputElement.selectionStart ?? 0;
        collapsed = caret === (inputElement.selectionEnd ?? 0);
        scrollLeft = inputElement.scrollLeft;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key !== "Tab" || event.shiftKey || !inputElement || !remainder) {
            return;
        }

        event.preventDefault();
        const text = value + remainder;
        inputElement.value = text;
        inputElement.setSelectionRange(text.length, text.length);
        value = text;
        syncCaret();
    }
</script>

<div class="ghost-input">
    <input
        bind:this={inputElement}
        bind:value
        type="text"
        name="q"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck={false}
        placeholder="Search"
        oninput={syncCaret}
        onkeydown={handleKeydown}
        onkeyup={syncCaret}
        onclick={syncCaret}
        onselect={syncCaret}
        onscroll={syncCaret}
        onfocus={() => {
            onFocus?.();
            syncCaret();
        }}
        onblur={(event) => onBlur?.(event)}
    />
    {#if remainder}
        <span
            class="ghost"
            aria-hidden="true"
            style="--scroll: {-scrollLeft}px"
        >
            <span class="ghost-typed">{typed}</span><span class="ghost-remainder"
                >{remainder}</span
            >
        </span>
    {/if}
</div>

<style>
    .ghost-input {
        position: relative;
        flex: 1;
        min-width: 0;
    }

    .ghost-input input {
        box-sizing: border-box;
        width: 100%;
        padding: 0.5rem;
        padding-left: 2.5rem;
        border: 1px solid #ccc;
        font-size: var(--font-size-base);
        line-height: var(--leading-body);
        font-family: inherit;
        caret-color: var(--text);
    }

    .ghost {
        position: absolute;
        inset: 0;
        border: 1px solid transparent;
        padding: 0.5rem;
        padding-left: 2.5rem;
        font-size: var(--font-size-base);
        line-height: var(--leading-body);
        font-family: inherit;
        white-space: pre;
        overflow: hidden;
        pointer-events: none;
        color: var(--text-muted);
        transform: translateX(var(--scroll, 0px));
    }

    .ghost-typed {
        color: transparent;
    }

    .ghost-input input:not(:focus) + .ghost {
        display: none;
    }
</style>
