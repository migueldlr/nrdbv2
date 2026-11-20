<script lang="ts">
	import type { Ruling } from '$lib/types';
	import { format_date } from '$lib/utils';
	import Icon from './Icon.svelte';
	import Hint from './ui/Hint.svelte';
	import HintTrigger from './ui/HintTrigger.svelte';

	interface Props {
		data: Ruling;
	}

	let { data }: Props = $props();
</script>

<li data-id="ruling" class="ruling">
	<header class="ruling__meta">
		<Hint>
			{#if data.attributes.nsg_rules_team_verified}
				<HintTrigger content="Verified by the NSG rules team">
					{#snippet child({ props })}
						<button {...props} type="button" class="ruling__status ruling__verified">
							<Icon name="check" size="sm" label="Verified by the NSG rules team" />
						</button>
					{/snippet}
				</HintTrigger>
			{:else}
				<HintTrigger content="Not yet reviewed by the current NSG rules team">
					{#snippet child({ props })}
						<button {...props} type="button" class="ruling__status ruling__unverified">
							<Icon
								name="question"
								size="sm"
								label="Not yet reviewed by the current NSG rules team"
							/>
						</button>
					{/snippet}
				</HintTrigger>
			{/if}
		</Hint>
		<!-- TODO(i18n): use i18n value -->
		<span>
			Updated
			<time datetime={data.attributes.updated_at}
				>{format_date(data.attributes.updated_at)}</time
			>
		</span>
	</header>
	{#if data.attributes.question}
		<!-- TODO: Markdown formatting on question -->
		<p class="ruling__question">{data.attributes.question}</p>
		<p class="ruling__answer">{data.attributes.answer}</p>
	{/if}
	{#if data.attributes.text_ruling}
		<p>{data.attributes.text_ruling}</p>
	{/if}
</li>

<style>
	.ruling {
		display: grid;
		gap: var(--space-2);

		p {
			margin: 0;
		}
	}

	.ruling__question {
		font-weight: var(--font-weight-semibold);
	}

	.ruling__answer {
		border-left: 2px solid var(--border);
		padding-left: var(--space-3);
	}

	.ruling__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-2);
		font-size: var(--font-size-sm);
		color: var(--text-muted);
	}

	.ruling__status {
		display: inline-flex;
		padding: 0;
		border: none;
		background: none;
		color: inherit;
		cursor: help;
	}

	.ruling__verified {
		color: var(--verified);
	}
</style>
