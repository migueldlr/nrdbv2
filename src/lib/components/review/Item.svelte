<script lang="ts">
	import { format_date } from '$lib/utils';
	import Comment from '$lib/components/Comment.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { Review } from '$lib/types';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		review: Review;
	}

	let { review }: Props = $props();
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
			<time datetime={review.attributes.created_at}>
				{format_date(review.attributes.created_at)}
			</time>
		</span>
	</header>

	<p class="review__body">{review.attributes.body}</p>

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
		align-items: baseline;
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

	.review__comments {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		padding: 0 0 0 1rem;
		border-left: 2px solid var(--border);
		list-style: none;
	}
</style>
