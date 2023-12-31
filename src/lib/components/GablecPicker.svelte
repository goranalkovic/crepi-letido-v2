<script>
	// @ts-nocheck
	import { getContext } from 'svelte';

	import { get } from 'svelte/store';
	import { slide } from 'svelte/transition';

	import { AlertCircle, Lock, Pencil, Phone, Truck, LeafyGreen, ChefHat, CheckCircle, ExternalLink } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Toggle } from '$lib/components/ui/toggle';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Separator } from '$lib/components/ui/separator';
	import * as Tooltip from '$lib/components/ui/tooltip';

	import DialogClose from './DialogClose.svelte';
	import { goto } from '$app/navigation';

	let errorData;

	const resturantData = getContext('resturantData');
	const mealSelectionData = getContext('mealSelectionData');

	export let supabase;
	export let session;

	const date = new Date();
	const currentYear = date.getFullYear();
	const currentDay = date.getDate().toString().padStart(2, '0');
	const currentMonth = (date.getMonth() + 1).toString().padStart(2, '0');
	const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;

	const handleMealSelect = async (restaurantName, mealIndex, included = false) => {
		const user = get(mealSelectionData).currentUserData;

		let currentRestaurantMeals = user?.selected?.[restaurantName];

		// console.log({restaurantName, mealIndex, included})
		// console.log({user, currentRestaurantMeals, restaurantName})

		if (!currentRestaurantMeals) {
			await supabase
				.from('meal-selections')
				.update({
					selected: {
						...user.selected,
						[restaurantName]: [{ meal: mealIndex }],
					},
				})
				.eq('user', session?.user?.email)
				.gte('created', `${currentDate} 00:00:00`)
				.lte('created', `${currentDate} 23:59:59`);
			return;
		}

		const mealExists = currentRestaurantMeals?.find(({ meal }) => meal === mealIndex);

		if (included && !mealExists) {
			currentRestaurantMeals = [
				...currentRestaurantMeals,
				{
					meal: mealIndex,
				},
			];
		}

		if (!included && mealExists) {
			currentRestaurantMeals = currentRestaurantMeals.filter(({ meal }) => meal !== mealIndex);
		}

		if (currentRestaurantMeals?.length < 1) {
			const newSelected = { ...user.selected };
			delete newSelected[restaurantName];

			// console.log({newSelected});
			await supabase
				.from('meal-selections')
				.update({
					selected: newSelected,
				})
				.eq('user', session?.user?.email)
				.gte('created', `${currentDate} 00:00:00`)
				.lte('created', `${currentDate} 23:59:59`);
		} else {
			await supabase
				.from('meal-selections')
				.update({
					selected: {
						...user.selected,
						[restaurantName]: currentRestaurantMeals,
					},
				})
				.eq('user', session?.user?.email)
				.gte('created', `${currentDate} 00:00:00`)
				.lte('created', `${currentDate} 23:59:59`);
		}
	};

	const handleMealNoteUpdate = async (restaurantName, mealIndex, note) => {
		const user = get(mealSelectionData).currentUserData;

		const currentRestaurantMeals = [...user?.selected?.[restaurantName]];
		currentRestaurantMeals[mealIndex].customText = note;

		await supabase
			.from('meal-selections')
			.update({
				selected: {
					...user.selected,
					[restaurantName]: currentRestaurantMeals,
				},
			})
			.eq('user', session?.user?.email)
			.gte('created', `${currentDate} 00:00:00`)
			.lte('created', `${currentDate} 23:59:59`);
	};

	const handlePickFinalize = async () => {
		await supabase
			.from('meal-selections')
			.update({
				final: true,
			})
			.eq('user', session?.user?.email)
			.gte('created', `${currentDate} 00:00:00`)
			.lte('created', `${currentDate} 23:59:59`);

		goto('/gableci');
	};

	$: userSelections = $mealSelectionData?.currentUserData?.selected;

	$: isFinalized = $mealSelectionData?.currentUserData?.final;

	let tempNoteText = '';
</script>

{#if $resturantData?.length < 1}
	<Alert.Root>
		<AlertCircle class="w-4 h-4 stroke-red-600 dark:stroke-red-300" />
		<Alert.Title class="font-semibold text-red-600 dark:text-red-300">Neki vrag je crkel</Alert.Title>
		<Alert.Description class="flex flex-col items-start gap-1">
			Podataka o restoranima nigdar.
			<AlertDialog.Root>
				<AlertDialog.Trigger asChild let:builder>
					<Button builders={[builder]} variant="outline" size="sm" class="mt-2">Kaj se zbilo?</Button>
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Jbg, nekaj je crklo</AlertDialog.Title>
						<AlertDialog.Description>
							<code class="text-xs w-96">{errorData}</code>
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Action>Odletido</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Alert.Description>
	</Alert.Root>
{:else if $resturantData?.length > 0}
	<div class="mt-8 mb-12 text-center">
		<p class="text-lg font-semibold tracking-tight scroll-m-20 text-muted-foreground">Prvo i prvo</p>
		<h2 class="text-3xl font-semibold tracking-tight transition-colors scroll-m-20">Odabir gableca</h2>
	</div>

	{#if isFinalized}
		<Alert.Root class="max-w-md mx-auto mt-4 mb-40 border-green-200 bg-gradient-to-br from-green-200/30 to-green-50/0 dark:from-green-200/10 dark:border-green-950">
			<CheckCircle class="w-4 h-4 stroke-green-500" />
			<Alert.Title>Odabir finaliziran</Alert.Title>
			<Alert.Description class="text-muted-foreground">Više nema prčkanja po odabirama, ali dobar bum pa buš mogel videti kaj si mogel ili ne kliknuti.</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="flex flex-wrap justify-center gap-8">
		{#each $resturantData as { meals, restaurant, id } (id)}
			<section class="relative overflow-hidden border w-96 rounded-xl border-border shrink-0">
				<div class="grid grid-cols-1 grid-rows-1 overflow-hidden h-44">
					<img class="w-48 h-32 col-start-1 col-end-1 row-start-1 row-end-1 duration-1000 scale-150 translate-x-8 translate-y-2" src="/restaurant-icons/{restaurant.slug}.png" alt={restaurant?.name} />
					<div
						class="flex flex-col items-center justify-center col-start-1 col-end-1 row-start-1 row-end-1 gap-2 p-2 bg-background/80 backdrop-blur-2xl backdrop-saturate-150 backdrop-brightness-105 dark:backdrop-brightness-125"
					>
						<div class="flex items-center self-center justify-center w-12 border rounded shadow-sm aspect-square bg-background/90 border-muted">
							<img class="w-8 aspect-square" src="/restaurant-icons/{restaurant.slug}.png" alt={restaurant?.name} />
						</div>
						<h2 class="text-lg font-semibold leading-none tracking-tight">
							{restaurant.name}
						</h2>
						{#if restaurant.phone || restaurant.delivery || (restaurant?.url?.length > 0 && restaurant?.urlType === 'menu')}
							<div class="flex justify-center gap-1 mt-3 text-sm text-muted-foreground">
								{#if restaurant.phone}
									<div class="px-1.5 py-0.5 bg-background rounded border border-muted shadow-sm text-muted-foreground flex items-center gap-1">
										<Phone class="w-4 h-4 opacity-40 stroke-[1.5]" />
										{restaurant.phone}
									</div>
								{/if}

								{#if restaurant.delivery}
									<div class="px-1.5 py-0.5 bg-background rounded border border-muted shadow-sm text-muted-foreground flex items-center gap-1 select-none">
										<Truck class="w-5 h-5 opacity-40 stroke-[1.5]" />
										{restaurant.delivery}
									</div>
								{/if}

								{#if restaurant?.url?.length > 0 && restaurant?.urlType === 'menu'}
									<a
										href={restaurant?.url}
										class="px-1.5 py-0.5 bg-background rounded border border-muted shadow-sm text-muted-foreground flex items-center gap-1 group select-none hover:border-blue-400 dark:hover:border-cyan-400 transition"
										target="_blank"
									>
										<ChefHat class="w-5 h-5 transition stroke-[1.5] opacity-40 group-hover:stroke-blue-500 group-hover:opacity-60 dark:group-hover:stroke-cyan-300" />
										Meni
										<ExternalLink class="w-3.5 h-3.5 opacity-25" />
									</a>
								{/if}
							</div>
						{/if}
					</div>
				</div>
				<div class="flex flex-col gap-1 py-4 overflow-y-auto border-t h-72 border-border scrollbar-hide">
					{#each meals as { name, price, meta, isCustomItem, hasCustomText, hasTopSeparator }, index (index + 1)}
						{@const isSelected = typeof userSelections?.[restaurant?.slug]?.find(({ meal }) => meal === index) !== 'undefined'}
						{#if hasTopSeparator}
							<Separator class="my-2" />
						{/if}

						<div class="flex items-center mx-4">
							<Toggle
								class="justify-start p-4 w-full {hasCustomText || isCustomItem ? 'h-12' : 'h-auto'} {(hasCustomText || isCustomItem) && isSelected && !isFinalized ? 'rounded-r-none' : ''} {isSelected && !isFinalized ? 'border border-gray-200 dark:border-muted bg-gradient-to-tl from-muted/5 to-background' : ''}"
								pressed={isSelected}
								onPressedChange={(v) => handleMealSelect(restaurant?.slug, index, v)}
								disabled={isFinalized}
							>
								<div class="grid gap-1.5 leading-none text-start">
									<span class="inline-flex items-center gap-2">
										{@html name}

										{#if meta?.isVegetarian}
											<Tooltip.Root>
												<Tooltip.Trigger><LeafyGreen class="w-3 h-3 mr-1 stroke-green-600 dark:stroke-green-400" /></Tooltip.Trigger>
												<Tooltip.Content>
													<p>Vege-friendly jelo</p>
												</Tooltip.Content>
											</Tooltip.Root>
										{/if}
									</span>
									{#if price}
										<p class="text-sm text-muted-foreground">
											{price}
										</p>
									{/if}
								</div>
							</Toggle>

							{#if isCustomItem && restaurant?.url && !isFinalized}
								<Button href={restaurant?.url} target="_blank" rel="noopener noreferrer" variant={isSelected ? 'outline' : 'ghost'} class="h-12 border-l-0 {isSelected ? (hasCustomText ? 'border-r rounded-none' : 'rounded-l-none') : 'border-x-0'} border-gray-200 dark:border-muted transition hover:bg-secondary hover:shadow-inner">
									<ChefHat class="w-5 h-5 stroke-[1.5]" />
								</Button>
							{/if}

							{#if hasCustomText && isSelected && !isFinalized}
								<Dialog.Root
									onOpenChange={(open) => {
										if (!open) {
											handleMealNoteUpdate(restaurant?.slug, index, tempNoteText);
										} else {
											tempNoteText = userSelections?.[restaurant?.slug]?.find(({ meal }) => meal === index)?.customText ?? '';
										}
									}}
								>
									<Dialog.Trigger class="flex items-center justify-center h-12 transition border border-l-0 border-gray-200 hover:shadow-inner hover:bg-secondary aspect-square dark:border-muted rounded-r-md">
										<Pencil class="w-5 h-5 stroke-[1.5]" />
									</Dialog.Trigger>
									<Dialog.Content>
										<Dialog.Header>
											<Dialog.Title>Ke buš točno?</Dialog.Title>
											<Dialog.Description>Ak imaš neku želju za nekaj od jela, napiši ovdje.</Dialog.Description>
										</Dialog.Header>

										<Textarea bind:value={tempNoteText} id="mealNotes-r-{id}-m-{index + 1}" />

										<Dialog.Footer>
											<DialogClose>
												<Button type="submit">Dobreko</Button>
											</DialogClose>
										</Dialog.Footer>
									</Dialog.Content>
								</Dialog.Root>
							{/if}
						</div>
					{/each}
				</div>
				<div class="absolute bottom-0 left-0 right-0 z-10 h-6 pointer-events-none bg-gradient-to-t from-background to-background/0"></div>
				<div class="absolute left-0 right-0 z-10 h-3.5 mt-px pointer-events-none top-44 bg-gradient-to-b from-background to-background/0"></div>
			</section>
		{/each}
	</div>

	{#if Object.keys(userSelections ?? {})?.length > 0 && !isFinalized}
		<AlertDialog.Root>
			<AlertDialog.Trigger>
				<div transition:slide class="fixed z-30 bottom-16 right-16">
					<Button
						class="flex items-center h-16 gap-2 px-6 text-lg transition shadow-lg hover:shadow-xl bg-gradient-to-br from-amber-100 to-amber-400 border-amber-500 hover:border-amber-600 text-amber-950 rounded-2xl"
					>
						<CheckCircle class="w-6 h-6" />
						Finaliziraj
					</Button>
				</div>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>'El to sve?</AlertDialog.Title>
					<AlertDialog.Description
						>Jednom kad se narudžba finalizira, izbor jela se zaključava i povratka više nema. Ostali izbori budu i dalje vidljivi, ali glasanje neće raditi dok se ne finalizira narudžba.<br /><br
						/>Žalbe se mogu poslati na
						<code class="font-mono">uprava@vodo-vod.ck.mdmjr</code></AlertDialog.Description
					>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Samo malo</AlertDialog.Cancel>
					<AlertDialog.Action on:click={handlePickFinalize}>Ideme!</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	{/if}
{:else}
	<div class="flex flex-col gap-4">
		<Skeleton class="w-full h-[14rem] rounded-lg" />
		<Skeleton class="w-full h-[14rem] rounded-lg" />
		<Skeleton class="w-full h-[14rem] rounded-lg" />
		<Skeleton class="w-full h-[14rem] rounded-lg" />
		<Skeleton class="w-full h-[14rem] rounded-lg" />
		<Skeleton class="w-full h-[14rem] rounded-lg" />
		<Skeleton class="w-full h-[14rem] rounded-lg" />
	</div>
{/if}
