<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { locales, getLocale, setLocale, localizeHref } from '$lib/paraglide/runtime.js';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { theme as current_theme } from '$lib/store';
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/state';
	import { APP_NAME } from '$lib/constants';
	import Button from '$lib/components/ui/Button.svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import {
		Dropdown,
		DropdownItem,
		DropdownRadioGroup,
		DropdownRadioItem,
		DropdownSeparator
	} from '$lib/components/ui/dropdown';

	let signout_form = $state<HTMLFormElement | null>(null);

	const locale_labels: Record<(typeof locales)[number], string> = {
		en: 'English',
		de: 'Deutsch'
	};

	// TODO(theme): review, as currently we utilise `light-dark` in CSS, which us purely based on user preference
	const set_theme = (theme: 'light' | 'dark') => {
		$current_theme = theme;
		localStorage.setItem('theme', theme);
		document.documentElement.setAttribute('data-theme', theme);
	};
</script>

<header class="site-header">
	<div class="container site-header__inner">
		<a href={localizeHref('/')} class="site-header__logo">
			<Logo />
			<span class="site-header__wordmark">{APP_NAME}</span>
		</a>

		<div class="site-header__search">
			<SearchInput />
		</div>

		<Dropdown>
			{#snippet trigger({ props })}
				<Button {...props} class="site-header__account-trigger" color="secondary" size="sm">
					{#if page.data.session?.user?.image}
						<img
							class="site-header__avatar"
							src={page.data.session.user.image}
							alt=""
						/>
					{/if}
					<span class="site-header__account-label">
						{page.data.session?.user?.name ?? m.account()}
					</span>
					<span class="site-header__chevron">
						<ChevronDownIcon />
					</span>
				</Button>
			{/snippet}

			{#if page.data.session}
				<DropdownItem onSelect={() => signout_form?.requestSubmit()}
					>{m.logout()}</DropdownItem
				>
			{:else}
				<DropdownItem onSelect={() => signIn('nsg-keycloak')}>
					{m.login()}/{m.register()}
				</DropdownItem>
			{/if}

			<DropdownSeparator />

			<DropdownRadioGroup
				label={m.theme()}
				value={$current_theme ?? 'light'}
				onValueChange={(value: string) => set_theme(value as 'light' | 'dark')}
			>
				<DropdownRadioItem value="light">Light</DropdownRadioItem>
				<DropdownRadioItem value="dark">Dark</DropdownRadioItem>
			</DropdownRadioGroup>

			<DropdownSeparator />

			<DropdownRadioGroup
				label={m.language()}
				value={getLocale()}
				onValueChange={(value: string) => setLocale(value as (typeof locales)[number])}
			>
				{#each locales as locale (locale)}
					<DropdownRadioItem value={locale}>{locale_labels[locale]}</DropdownRadioItem>
				{/each}
			</DropdownRadioGroup>
		</Dropdown>

		<form
			bind:this={signout_form}
			method="POST"
			action="/signout"
			class="site-header__signout-form"
		></form>
	</div>
</header>

<style>
	.site-header {
		border-bottom: 1px solid var(--border);
		background-color: var(--foreground);
	}

	.site-header__inner {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
		padding-block: 1rem;
	}

	.site-header__logo {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
		white-space: nowrap;
	}

	.site-header__search {
		width: 100%;
		max-width: 40rem;
		justify-self: center;
	}

	.site-header__account-label {
		white-space: nowrap;
	}

	.site-header__avatar {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		object-fit: cover;
	}

	.site-header__chevron {
		display: flex;
	}

	.site-header__chevron :global(svg) {
		width: 1em;
		height: 1em;
	}

	.site-header__signout-form {
		display: none;
	}

	@media (max-width: 640px) {
		.site-header__wordmark,
		.site-header__account-label {
			display: none;
		}
	}
</style>
