<script lang="ts">
	import { format_date, format_relative_time } from '$lib/utils';
	import Comment from '$lib/components/Comment.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { Review } from '$lib/types';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		review: Review;
		collapsible?: boolean;
	}

	let { review, collapsible = false }: Props = $props();

	let expanded = $state(false);
	let overflowing = $state(false);
	let body_element: HTMLParagraphElement | undefined = $state();

	$effect(() => {
		if (!collapsible || !body_element) return;
		void review.attributes.body;
		overflowing = body_element.scrollHeight > body_element.clientHeight + 1;
	});
</script>

<article data-id="review" class="review">
	<header class="review__meta">
		<a class="review__author" href={localizeHref(`/profile/${review.attributes.username}`)}>
			{review.attributes.username}
		</a>
		<span class="review__votes" aria-label="{review.attributes.votes} votes">
			<Icon name="heart" size="sm" />
			{review.attributes.votes}
		</span>
		<span class="review__date">
			<time
				datetime={review.attributes.created_at}
				title={format_date(review.attributes.created_at)}
			>
				{format_relative_time(review.attributes.created_at)}
			</time>
		</span>
	</header>

	<p
		class="review__body"
		class:review__body--collapsed={collapsible && !expanded}
		bind:this={body_element}
	>
		{review.attributes.body}
	</p>

	{#if collapsible && (overflowing || expanded)}
		<!-- TODO(i18n): use i18n value -->
		<button class="review__toggle" onclick={() => (expanded = !expanded)}>
			{expanded ? 'Show less' : 'Read full review'}
		</button>
	{/if}

	{#if review.attributes.comments.length > 0}
		<ul class="review__comments">
			{#each review.attributes.comments as comment, index (index)}
				<Comment {comment} />
			{/each}
		</ul>
	{/if}
</article>

<style>
	.review {
		display: grid;
		gap: var(--space-3);
		min-width: 0;
		padding-block: 1.25rem;
		border-top: 1px solid var(--border);
		overflow-wrap: anywhere;
	}

	.review:first-child {
		padding-top: 0;
		border-top: none;
	}

	.review__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-3);
		font-size: var(--font-size-sm);
	}

	.review__author {
		font-weight: var(--font-weight-bold);
		color: var(--text);
		text-decoration: none;
	}

	.review__author:hover {
		text-decoration: underline;
	}

	.review__votes {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.review__date {
		margin-left: auto;
		color: var(--text-muted);
	}

	.review__body {
		margin: 0;
		line-height: var(--leading-body);
	}

	.review__body--collapsed {
		max-height: 12rem;
		overflow: hidden;
		mask-image: linear-gradient(to bottom, black 70%, transparent);
	}

	.review__toggle {
		justify-self: start;
		padding: 0;
		border: none;
		background: none;
		color: var(--text);
		font: inherit;
		font-size: var(--font-size-sm);
		text-decoration: underline;
		cursor: pointer;
	}

	.review__comments {
		display: grid;
		gap: var(--space-3);
		margin: var(--space-2) 0 0;
		padding: 0 0 0 1rem;
		border-left: 2px solid var(--border);
		list-style: none;
	}
</style>
