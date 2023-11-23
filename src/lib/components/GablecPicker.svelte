<script>
	// @ts-nocheck
	import { getContext } from 'svelte';

	import { get } from 'svelte/store';
	import { slide } from 'svelte/transition';

	import { AlertCircle, Lock, Pencil, Phone, Truck, LeafyGreen, ChefHat, CheckCircle } from 'lucide-svelte';
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
				.gte('created', `${currentDate} 00:00:00`).lte('created', `${currentDate} 23:59:59`);
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
				.gte('created', `${currentDate} 00:00:00`).lte('created', `${currentDate} 23:59:59`);
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
				.gte('created', `${currentDate} 00:00:00`).lte('created', `${currentDate} 23:59:59`);
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
			.gte('created', `${currentDate} 00:00:00`).lte('created', `${currentDate} 23:59:59`);
	};

	const handlePickFinalize = async () => {
		await supabase
			.from('meal-selections')
			.update({
				final: true,
			})
			.eq('user', session?.user?.email)
			.gte('created', `${currentDate} 00:00:00`).lte('created', `${currentDate} 23:59:59`);

		goto('/gableci');
	};

	$: userSelections = $mealSelectionData?.currentUserData?.selected;

	let tempNoteText = '';
</script>

{session?.user?.email}

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
{:else if $resturantData?.length > 0 && !$mealSelectionData?.currentUserData?.final}
	{#if Object.keys($mealSelectionData?.currentUserData?.selected ?? {})?.length > 0}
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

	<div class="mt-8 mb-12 text-center">
		<p class="text-lg font-semibold tracking-tight scroll-m-20 text-muted-foreground">Prvo i prvo</p>
		<h2 class="text-3xl font-semibold tracking-tight transition-colors scroll-m-20">Odabir gableca</h2>
	</div>

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
						<h2 class="text-lg font-semibold leading-none tracking-tight">{restaurant.name}</h2>
						{#if restaurant.phone || restaurant.delivery}
							<div class="flex justify-center gap-1 mt-3 text-sm text-muted-foreground">
								{#if restaurant.phone}
									<div class="px-1.5 py-0.5 bg-background rounded border border-muted shadow-sm text-muted-foreground flex items-center gap-1">
										<Phone class="w-4 h-4 opacity-40" />
										{restaurant.phone}
									</div>
								{/if}

								{#if restaurant.delivery}
									<div class="px-1.5 py-0.5 bg-background rounded border border-muted shadow-sm text-muted-foreground flex items-center gap-1">
										<Truck class="w-5 h-5 opacity-40" />
										{restaurant.delivery}
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
				<div class="flex flex-col gap-1 py-4 overflow-y-auto border-t h-72 border-border scrollbar-hide">

					<pre>{JSON.stringify(userSelections?.[restaurant.slug])}</pre>

					{#each meals as { name, price, meta, isCustomItem, hasCustomText, hasTopSeparator }, index (index + 1)}
						{#if hasTopSeparator}
							<Separator class="my-2" />
						{/if}

						<div class="flex items-center mx-4 {$mealSelectionData?.currentUserData?.selected?.[restaurant?.slug]?.find(({ meal }) => meal === index) ? 'gap-0.5' : 'gap-1'}">
							<Toggle
								class="justify-start p-4 w-full {hasCustomText || isCustomItem ? 'h-12' : 'h-auto'} {(hasCustomText || isCustomItem) &&
								$mealSelectionData?.currentUserData?.selected?.[restaurant?.slug]?.find(({ meal }) => meal === index)
									? 'rounded-r-none'
									: ''}"
								pressed={$mealSelectionData?.currentUserData?.selected?.[restaurant?.slug]?.find(({ meal }) => meal === index)}
								onPressedChange={(v) => handleMealSelect(restaurant?.slug, index, v)}
							>
								<div class="grid gap-1.5 leading-none text-start">
									<span class="inline-flex items-center gap-2">
										{#if isCustomItem}
											{@html name}
										{:else}
											{name}
										{/if}

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

							{#if isCustomItem && restaurant?.url}
								<Button
									href={restaurant?.url}
									target="_blank"
									rel="noopener noreferrer"
									variant={$mealSelectionData?.currentUserData?.selected?.[restaurant?.slug]?.find(({ meal }) => meal === index) ? 'secondary' : 'ghost'}
									class="h-12 {$mealSelectionData?.currentUserData?.selected?.[restaurant?.slug]?.find(({ meal }) => meal === index) ? 'rounded-none' : ''} transition"
								>
									<ChefHat class="w-5 h-5" />
								</Button>
							{/if}

							{#if hasCustomText && $mealSelectionData?.currentUserData?.selected?.[restaurant?.slug]?.find(({ meal }) => meal === index)}
								<Dialog.Root
									onOpenChange={(open) => {
										if (!open) {
											handleMealNoteUpdate(restaurant?.slug, index, tempNoteText);
										} else {
											tempNoteText = $mealSelectionData?.currentUserData?.selected?.[restaurant?.slug]?.find(({ meal }) => meal === index)?.customText ?? '';
										}
									}}
								>
									<Dialog.Trigger class="flex items-center justify-center h-12 aspect-square bg-muted rounded-r-md">
										<Pencil class="w-5 h-5" />
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
{:else if $resturantData?.length > 0 && $mealSelectionData?.currentUserData?.final}
	<div class="flex flex-col items-center justify-center py-20">
		<Lock class="w-10 h-10 opacity-40" />
		<h1 class="mt-6 text-4xl font-extrabold tracking-tight select-none scroll-m-20 lg:text-5xl">Kaj se biralo, biralo se</h1>
		<p class="mt-4">Izbori su sada lockani</p>
		<Button class="mt-12" href="/gableci">Pogleč kaj se izabralo</Button>
	</div>
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
