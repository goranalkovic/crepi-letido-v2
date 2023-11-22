<script>
	// @ts-nocheck

	import SignupForm from '$lib/components/SignupForm.svelte';

	import { slide } from 'svelte/transition';

	export let data;
	$: ({ session } = data);

	let counter = 0;
	const crepQuotes = ['Črepi, črepi letido!', 'Ono.', 'Tornado bu, jebote.', 'Isusa ti! Se trga!', 'Alo! Nejdi, črepi letido.'];

	let clear;
	$: {
		clearInterval(clear);
		clear = setInterval(() => {
			counter += 1;

			if (counter > crepQuotes.length - 1) {
				counter = 0;
			}
		}, 5000);
	}

	const loggedInSections = [
		{
			url: '/crep-storm',
			imageUrl: 'https://images.unsplash.com/photo-1560235030-755a96d5b1ac?ixlib=rb-4.0.3fm=jpg&crop=entropy&cs=srgb&dl=maria-teneva-5iJ8MphQ7aI-unsplash.jpg&w=640&auto=format&fit=crop&q=80&w=500',
			imageAlt: 'Nekaj fino za jesti',
			label: 'Črep-Storm™',
			description: 'Črepi, ali pak v 3D-ju!',
		},
		{
			url: '/gableci',
			imageUrl: 'https://images.unsplash.com/photo-1601356616077-695728ae17cb?ixlib=rb-4.0.3&fm=jpg&crop=entropy&cs=srgb&dl=chumil-photo-TK5VlaGqkZc-unsplash.jpg&auto=format&fit=crop&q=80&w=500',
			imageAlt: 'Nekaj fino za jesti',
			label: 'GablecPicker',
			description: 'Jel bi nekaj, a?',
		},
	];
</script>

<div class="container relative flex flex-col items-center justify-center h-screen overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
	<div
		class="absolute inset-0 scale-125 bg-cover brightness-50 opacity-20 blur-sm grayscale lg:hidden -z-10"
		style="background-image: url(https://unsplash.com/photos/D_R405s8tUM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzAwMDczMjIxfA&auto=format&fit=crop&w=1376&q=80);"
	/>

	<div class="relative flex-col hidden h-full p-10 text-white bg-muted dark:border-r lg:flex">
		<div
			class="absolute inset-0 bg-cover brightness-50 saturate-0"
			style="background-image: url(https://unsplash.com/photos/D_R405s8tUM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzAwMDczMjIxfA&auto=format&fit=crop&w=1376&q=80);"
		/>


		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				{#each crepQuotes as quote, i}
					{#if counter === i}
						<p class="text-lg" transition:slide>
							&ldquo;{quote}&rdquo;
						</p>
					{/if}
				{/each}
				<footer class="text-sm">&ndash; Robert Soltic</footer>
			</blockquote>
		</div>
	</div>

	<div class="lg:p-8">
		<div class="flex flex-col justify-center w-auto mx-auto space-y-6">
			{#if session !== null}
				<div class="flex flex-col space-y-2 text-center">
					<h1 class="text-2xl font-semibold tracking-tight">Dobrodošli v Črepi letido!</h1>
					<p class="text-sm text-muted-foreground">Kaj buš denes?</p>
				</div>

				<div class="flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
					{#each loggedInSections as { url, imageUrl, imageAlt, label, description }}
						<a href={url} class="space-y-3 shrink-0">
							<div class="overflow-hidden rounded-lg w-fit h-fit">
								<img class="h-auto w-40 md:w-60 xl:w-80 object-cover transition-all hover:scale-105 aspect-square lg:aspect-[3/4]" src={imageUrl} alt={imageAlt} width={250} height={350} />
							</div>

							<div class="space-y-1 text-sm">
								<h3 class="font-medium leading-none">{label}</h3>
								<p class="text-xs text-muted-foreground">{description}</p>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<div class="flex flex-col space-y-2 text-center">
					<h1 class="text-2xl font-semibold tracking-tight">Spreman za Črep-Storm™?</h1>
					<p class="text-sm text-muted-foreground">Kaj čekaš, upiši e-mail!</p>
				</div>
				<SignupForm />
			{/if}
		</div>
	</div>
</div>
