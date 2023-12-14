<script>
	// @ts-nocheck
	import { getContext } from 'svelte';

	import { AlertCircle, Phone, Truck, LeafyGreen, CheckCircle, CircleSlash2, BadgeCheck, CheckCircle2, ChefHat, CheckCheck } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Separator } from '$lib/components/ui/separator';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Avatar from '$lib/components/ui/avatar';

	const resturantData = getContext('resturantData');
	const mealSelectionData = getContext('mealSelectionData');

	$: intersects = $mealSelectionData?.allSelectionData?.intersects;
	$: goldenIntersects = $mealSelectionData?.allSelectionData?.goldenIntersects;
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
							<code class="text-xs w-96">Lorem ipsum</code>
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Action>Odletido</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Alert.Description>
	</Alert.Root>
{:else if $mealSelectionData?.allSelectionData?.selectionData && Object.values($mealSelectionData?.allSelectionData?.selectionData).every((s) => s.every((j) => j.length === 0))}
	<div class="my-40 text-center">
		<p class="text-lg font-semibold tracking-tight scroll-m-20 text-muted-foreground">Hmmm...</p>
		<h2 class="text-3xl font-semibold tracking-tight transition-colors scroll-m-20">Nitko si još nikaj nije zel (ili pak nisu finalizirali).</h2>

		<Button class="mt-12" href="/gableci/pick">Aaaajmo, biraj!</Button>
	</div>
{:else if $resturantData?.length > 0}
	<div class="mt-8 mb-12 text-center">
		<p class="text-lg font-semibold tracking-tight scroll-m-20 text-muted-foreground">Ne prvo</p>
		<h2 class="text-3xl font-semibold tracking-tight transition-colors scroll-m-20">Kaj su drugi zeli?</h2>
	</div>

	{#if intersects?.length < 1 && goldenIntersects?.length < 1 && $mealSelectionData?.allSelectionData?.userData?.length > 1}
		<Alert.Root class="max-w-md mx-auto border-orange-200 bg-gradient-to-br from-orange-400/10 to-orange-50/0 dark:from-orange-400/10 dark:border-orange-900/50">
			<CircleSlash2 class="w-4 h-4 stroke-orange-400" />
			<Alert.Title>Nema intersektija 🥲</Alert.Title>
			<Alert.Description class="text-muted-foreground">Bude bolje zutra! #blameMajcen</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- <Alert.Root class="max-w-md shadow-md shadow-orange-400/10">
		<AlertTriangle class="w-4 h-4 stroke-orange-400" />
		<Alert.Title>Da ne bu kasnije <i>a kak nema</i></Alert.Title>
		<Alert.Description
			>Vidljivi su samo odabiri ljudi koji su finalizirali narudžbu!</Alert.Description
		>
	</Alert.Root> -->

	{#if $mealSelectionData?.currentUserData?.final}
		<Alert.Root class="max-w-md mx-auto mt-4 mb-40 border-green-200 bg-gradient-to-br from-green-200/30 to-green-50/0 dark:from-green-200/10 dark:border-green-950">
			<CheckCircle class="w-4 h-4 stroke-green-500" />
			<Alert.Title>Odabir finaliziran</Alert.Title>
			<Alert.Description class="text-muted-foreground">Lepe! Sad pričekaj da i drugi naprave isto.</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="flex flex-col gap-4 mx-auto mt-6 max-w-7xl">
		{#each [...$resturantData]
			.filter((r) => !$mealSelectionData?.allSelectionData?.selectionData?.[r.restaurant.slug]?.every((sels) => sels?.length === 0))
			.sort((a, b) => {
				const aData = $mealSelectionData?.allSelectionData?.selectionData?.[a.restaurant.slug];
				const bData = $mealSelectionData?.allSelectionData?.selectionData?.[b.restaurant.slug];

				if (!aData || !bData) {
					return 0;
				}

				const aTotal = aData?.reduce((prev, curr) => prev + (curr?.length ?? 0), 0);
				const bTotal = bData?.reduce((prev, curr) => prev + (curr?.length ?? 0), 0);

				if (aTotal === bTotal) {
					return 0;
				}

				return aTotal > bTotal ? -1 : 1;
			})
			.sort((a, b) => {
				if (intersects?.includes(a.restaurant.slug)) {
					return -1;
				}

				if (intersects?.includes(b.restaurant.slug)) {
					return 1;
				}

				return 0;
			})
			.sort((a, b) => {
				if (goldenIntersects?.includes(a.restaurant.slug)) {
					return -1;
				}

				if (goldenIntersects?.includes(b.restaurant.slug)) {
					return 1;
				}

				return 0;
			}) as { meals, restaurant, id } (id)}
			<Card.Root class="overflow-hidden flex max-md:flex-col md:min-h-[14rem] relative">
				{#if goldenIntersects?.includes(restaurant.slug)}
					<div class="flex items-center gap-1 p-2 font-semibold text-white rounded-r-lg shadow-inner drop-shadow-sm grad-bg-webgradients-122 absolute top-4 -left-0 z-20">
						<CheckCheck class="w-6 h-6" />
						Intersect+
					</div>
				{:else if intersects?.includes(restaurant.slug)}
					<div class="flex items-center gap-1 p-2 font-semibold text-white rounded-r-lg shadow-inner drop-shadow-sm grad-bg-webgradients-136 absolute top-4 -left-0 z-20">
						<CheckCheck class="w-6 h-6" />
						Intersect
					</div>
				{/if}
				<div class="grid grid-cols-1 grid-rows-1 overflow-hidden md:rounded-l-lg max-md:border-b md:w-1/3 border-border md:justify-between shrink-0">
					<img
						class="w-48 h-32 col-start-1 col-end-1 row-start-1 row-end-1 duration-1000 scale-150 lg:w-52 dark:md:w-32 max-md:translate-x-8 max-md:translate-y-2 md:justify-self-center md:self-center"
						src="/restaurant-icons/{restaurant.slug}.png"
						alt={restaurant?.name}
					/>
					<div
						class="flex flex-col items-center justify-center col-start-1 col-end-1 row-start-1 row-end-1 gap-2 p-2 max-md:py-8 md:rounded-l-lg bg-background/80 backdrop-blur-2xl backdrop-saturate-150 backdrop-brightness-105 dark:backdrop-brightness-125"
					>
						<div class="flex items-center self-center justify-center w-12 border rounded shadow-sm aspect-square bg-background/90 border-muted">
							<img class="w-8 aspect-square" src="/restaurant-icons/{restaurant.slug}.png" alt={restaurant?.name} />
						</div>
						<h2 class="text-lg font-semibold leading-none tracking-tight">
							{restaurant.name}
						</h2>
						{#if restaurant.phone || restaurant.delivery}
							<div class="flex flex-col items-center justify-center gap-1 mt-3 text-sm text-muted-foreground">
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
							</div>
						{/if}
					</div>
				</div>

				<Card.Content class="w-full pt-6">
					<div class="flex flex-col gap-1">
						{#each meals as { name, price, meta, isCustomItem }, index (index + 1)}
							{#if $mealSelectionData?.allSelectionData?.selectionData?.[restaurant?.slug]?.[index].length > 0}
								<div class="flex items-center justify-between gap-4 p-4">
									<div class="grid gap-1.5 leading-none text-start justify-start shrink-0">
										<span class="inline-flex items-center gap-2 text-sm font-medium">
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

									<div class="flex -space-x-6 hover:space-x-2">
										{#each $mealSelectionData?.allSelectionData?.selectionData?.[restaurant?.slug]?.[index] ?? [] as em}
											{#if em}
												{@const currentUser = $mealSelectionData?.allSelectionData.userData.find(({ email }) => email === em)}
												{@const mealCustomText = $mealSelectionData?.allSelectionData?.userSelections
													?.find(({ user }) => user === em)
													?.selected?.[restaurant?.slug]?.find(({ meal }) => meal === index)?.customText}
												<Tooltip.Root>
													<Tooltip.Trigger class="transition-[margin]">
														<Avatar.Root class="w-12 h-12 border-2 border-background">
															<Avatar.Image src="/profile-pictures/{currentUser.avatar}.jpg" alt="{currentUser.firstName ?? ''} {currentUser.lastName ?? ''}" />
															<Avatar.Fallback>{currentUser.firstName?.charAt(0) ?? '-'}{currentUser.lastName?.charAt(0) ?? '-'}</Avatar.Fallback>
														</Avatar.Root>
													</Tooltip.Trigger>
													<Tooltip.Content>
														<p>
															{currentUser?.firstName}
															{currentUser?.lastName}
														</p>
														{#if mealCustomText?.length > 0}
															<p class="w-64 mt-2">
																<span class="font-semibold">Želje i pozdravi</span> <br />
																<span class="italic">{mealCustomText}</span>
															</p>
														{/if}
													</Tooltip.Content>
												</Tooltip.Root>
											{/if}
										{/each}
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
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
