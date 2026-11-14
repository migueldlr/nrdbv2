<script lang="ts">
	import { format_date } from '$lib/utils';
	import type { Comment } from '$lib/types';
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		comment: Comment;
	}

	let { comment }: Props = $props();
</script>

<li data-id="comment" class="comment">
	<div class="comment__meta">
		<a class="comment__author" href={localizeHref(`/profile/${comment.user}`)}>{comment.user}</a
		>
		<time datetime={comment.created_at}>{format_date(comment.created_at)}</time>
	</div>
	<p class="comment__body">{comment.body}</p>
</li>

<style>
	.comment {
		display: grid;
		gap: var(--space-1);
		font-size: var(--font-size-sm);
	}

	.comment__meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-3);
		color: var(--text-muted);
	}

	.comment__author {
		font-weight: var(--font-weight-bold);
		color: var(--text);
		text-decoration: none;
	}

	.comment__body {
		margin: 0;
	}
</style>
