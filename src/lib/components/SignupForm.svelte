<script>
	// @ts-nocheck

	import { Loader2, MailWarning, AlertTriangle } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	import { slide } from 'svelte/transition';

	let emailValue = '';
	let message = '';

	let isLoading = false;
	let isLocked = false;

	const regex = /^([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+$/;
	$: isEmailValid = regex.test(emailValue);

	async function onSubmit(reg = false) {
		isLoading = true;
		message = '';
		const request = await fetch(`${location.origin}/api/auth/login?user=${emailValue}`);

		isLoading = false;
		isLocked = true;

		if (request.status === 200 && reg) {
			message = 'Mejl ti bu stigel da si pak se potvrdiš, prije neg buš mogel koristiti app';
		} else if (request.status === 200 && !reg) {
			message = 'Proveri si mejl, poruka z linkom za potvrdu prijave bu stigla uskoro.';
		} else {
			message = 'Nekaj ne dela kak treba. Žali se Gocu.';
		}
	}
</script>

<div class="grid gap-6 mx-auto w-72 lg:w-80" {...$$restProps}>
	<div class="grid gap-2">
		<div class="relative grid gap-1">
			<Label class="sr-only" for="email">Email</Label>
			<Input id="email" placeholder="ivek@crepi.letido" type="email" autocapitalize="none" autocomplete="email" autocorrect="off" disabled={isLoading} bind:value={emailValue} />
			{#if emailValue?.length > 3 && !isEmailValid}
				<span transition:slide class="flex items-center gap-2 pt-1 pb-2 text-sm text-red-600 dark:text-red-300">
					<AlertTriangle class="w-5 h-5" />
					Nekaj ne valja z mejlom
				</span>
			{/if}
		</div>
		<Button disabled={isLoading || isLocked || !isEmailValid} on:click={() => onSubmit(true)}>
			{#if isLoading}
				<Loader2 class="w-4 h-4 mr-2 animate-spin" />
				Počekaj, bu za čas
			{:else}
				Registiraj se ve
			{/if}
		</Button>
		<div class="relative my-4">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t" />
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="px-2 bg-background text-muted-foreground">Ili ako već imaš accounta</span>
			</div>
		</div>
		<Button disabled={isLoading || isLocked || !isEmailValid} on:click={onSubmit}>
			{#if isLoading}
				<Loader2 class="w-4 h-4 mr-2 animate-spin" />
				Počekaj, bu za čas
			{:else}
				Prijavi se
			{/if}
		</Button>
	</div>
</div>

{#if message?.length > 0}
	<p class="px-8 text-sm text-center text-muted-foreground">{message}</p>
{/if}
