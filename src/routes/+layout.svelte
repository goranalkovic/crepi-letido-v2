<script>
	// @ts-nocheck
	import '../app.postcss';

	import { page } from '$app/stores';

	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import UserTile from '$lib/components/UserTile.svelte';

	import { ModeWatcher } from 'mode-watcher';

	import { Badge } from '$lib/components/ui/badge';

	export let data;
	$: ({ session, userData } = data);
</script>

<ModeWatcher />

{#if $page?.route?.id?.includes('/gableci')}
	<div class="fixed top-0 left-0 right-0 z-10 h-32 bg-background/60 backdrop-saturate-200 backdrop-blur-xl"></div>
{/if}

<a href="/" class="fixed z-20 flex items-center h-10 gap-2 text-lg font-medium left-10 top-10 {$page.route.id === '/' ? 'text-white' : 'text-muted-foreground'}">
	Črepi letido

	{#if $page.route.id.includes('/gableci')}
		<span class="inline-flex items-center gap-1 font-semibold text-foreground">GablecPicker <Badge variant="secondary">Beta</Badge></span>
	{/if}
	{#if $page.route.id === '/crep-storm'}
		<span class="font-semibold text-foreground">ČrepStorm™</span>
	{/if}
	{#if $page.route.id === '/profile'}
		<span class="inline-flex items-center gap-1 font-semibold text-foreground">Profil <Badge variant="secondary">Beta</Badge></span>
	{/if}
</a>

<div class="fixed z-20 flex items-center gap-2 right-10 top-10">
	{#if session !== null}
		<UserTile user={userData} />
	{/if}
	<ThemeSwitcher />
</div>

<slot />
