<script lang="ts">
	import type { Ruling } from '$lib/types';
	import { format_date } from '$lib/utils';

	interface Props {
		data: Ruling;
	}

	let { data }: Props = $props();
</script>

<li data-id="ruling" class="ruling">
	{#if data.attributes.question}
		<!-- TODO: Markdown formatting on question -->
		<p class="ruling__question">{data.attributes.question}</p>
		<p class="ruling__answer">{data.attributes.answer}</p>
	{/if}
	{#if data.attributes.text_ruling}
		<p>{data.attributes.text_ruling}</p>
	{/if}
	<p class="ruling__meta">
		{#if data.attributes.nsg_rules_team_verified}
			<span class="ruling__verified">Verified</span>
		{:else}
			<span class="ruling__unverified" title="Not yet reviewed by the current NSG rules team">
				Unverified
			</span>
		{/if}
		<!-- TODO(i18n): use i18n value -->
		<span>
			Updated
			<time datetime={data.attributes.updated_at}
				>{format_date(data.attributes.updated_at)}</time
			>
		</span>
	</p>
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
		gap: var(--space-1) var(--space-3);
		font-size: var(--font-size-sm);
		color: var(--text-muted);
	}

	.ruling__verified,
	.ruling__unverified {
		font-weight: var(--font-weight-semibold);
	}

	.ruling__verified {
		color: var(--verified);
	}

	.ruling__unverified {
		cursor: help;
		text-decoration: underline dotted;
		text-underline-offset: 0.2em;
	}
</style>
