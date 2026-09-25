<script lang="ts">
	import { APP_NAME, NAVIGATION_GROUPS } from '$lib/constants';
	import Logo from '$lib/components/Logo.svelte';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { page } from '$app/state';

	const isCurrentPath = (url: string) => {
		const normalize = (path: string) => path.replace(/\/$/, '') || '/';

		return normalize(page.url.pathname) === normalize(url);
	};
</script>

<footer class="site-footer">
	<div class="container site-footer__inner">
		<div class="site-footer__brand">
			<a href={localizeHref('/')}>
				<Logo />
				{APP_NAME}
			</a>
		</div>

		<nav class="site-footer__nav" aria-label="Main">
			{#each NAVIGATION_GROUPS as group (group.title)}
				<div class="site-footer__group">
					<h2 class="site-footer__heading">{group.title}</h2>
					<ul class="site-footer__list">
						{#each group.items as item (item.url)}
							<li>
								<a
									href={item.url}
									aria-current={isCurrentPath(item.url) ? 'page' : undefined}
								>
									{item.title}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>
	</div>
</footer>

<style>
	.site-footer {
		padding-block: 3rem;
		border-top: 1px solid var(--border);
		background-color: var(--foreground);
	}

	.site-footer__inner {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr;
		gap: 2rem;
	}

	.site-footer__brand a {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
	}

	.site-footer__nav {
		grid-column: span 3;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}

	.site-footer__heading {
		margin-block: 0 0.75rem;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-caps);
		color: var(--text-muted);
	}

	.site-footer__list {
		margin: unset;
		padding: unset;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.site-footer__list a {
		color: inherit;
		text-decoration: none;
	}

	.site-footer__list a:hover {
		text-decoration: underline;
	}

	@media (max-width: 900px) {
		.site-footer__inner {
			grid-template-columns: 1fr;
		}

		.site-footer__nav {
			grid-column: auto;
			grid-template-columns: 1fr;
		}
	}
</style>
