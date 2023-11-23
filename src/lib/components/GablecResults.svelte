<script>
	// @ts-nocheck
	import { getContext } from 'svelte';

	import { AlertCircle, Phone, Truck, LeafyGreen, CheckCircle, CircleSlash2, CheckCheck } from 'lucide-svelte';
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
	<div class="my-8 text-center">
		<p class="text-lg font-semibold tracking-tight scroll-m-20 text-muted-foreground">Drugo</p>
		<h2 class="text-3xl font-semibold tracking-tight transition-colors scroll-m-20">Kaj su drugi zeli?</h2>
	</div>

	{#if intersects?.length < 1}
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
		<Alert.Root class="max-w-md mx-auto mt-4 border-green-200 bg-gradient-to-br from-green-200/30 to-green-50/0 dark:from-green-200/10 dark:border-green-950">
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
			}) as { meals, restaurant, id } (id)}
			<Card.Root class="flex max-lg:flex-col lg:min-h-[14rem]">
				<Card.Header class="max-lg:border-b lg:border-r lg:w-1/3 border-border lg:justify-between shrink-0">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-gray-100 border rounded dark:bg-gray-900 border-muted aspect-square">
							<img class="w-6 aspect-square" src="/restaurant-icons/{restaurant.slug}.png" alt={restaurant?.name} />
						</div>
						<div class="space-y-1 5">
							<Card.Title>
								{restaurant.name}
							</Card.Title>
						</div>

						{#if goldenIntersects?.includes(restaurant.slug)}
							<div class="flex items-center gap-1 p-2 ml-auto font-semibold text-white rounded-lg shadow-inner drop-shadow-md grad-bg-webgradients-122">
								<CheckCheck class="w-6 h-6" />
								Intersect+
							</div>
						{:else if intersects?.includes(restaurant.slug)}
							<div class="flex items-center gap-1 p-2 ml-auto font-semibold text-white rounded-lg shadow-inner drop-shadow-md grad-bg-webgradients-136">
								<CheckCheck class="w-6 h-6" />
								Intersect
							</div>
						{/if}
					</div>

					<Card.Description class="flex items-center gap-2 pt-2 lg:items-start lg:flex-col">
						{#if restaurant.phone}
							<div class="px-2 py-0.5 rounded-sm border border-muted text-muted-foreground flex items-center gap-2">
								<Phone class="w-4 h-4" />
								{restaurant.phone}
							</div>
						{/if}

						{#if restaurant.delivery}
							<div class="px-2 py-0.5 rounded-sm border border-muted text-muted-foreground flex items-center gap-2">
								<Truck class="w-4 h-4" />
								{restaurant.delivery}
							</div>
						{/if}
					</Card.Description>
				</Card.Header>

				<Card.Content class="w-full pt-6">
					<div class="flex flex-col gap-1">
						{#each meals as { name, price, meta, isCustomItem, hasTopSeparator }, index (index + 1)}
							{#if $mealSelectionData?.allSelectionData?.selectionData?.[restaurant?.slug]?.[index].length > 0}
								{#if hasTopSeparator}
									<Separator class="-ml-6 w-[calc(100%_+_3rem)] my-6" />
								{/if}

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
