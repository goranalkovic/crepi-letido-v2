<script>
	// @ts-nocheck
	import { setContext } from 'svelte';
	import { readable, get, writable } from 'svelte/store';
	import { parse } from 'node-html-parser';

	import { Button } from '$lib/components/ui/button';

	import { page } from '$app/stores';

	export let data;
	$: ({ supabase, session } = data);

	const date = new Date();
	const currentYear = date.getFullYear();
	const currentDay = date.getDate().toString().padStart(2, '0');
	const currentMonth = (date.getMonth() + 1).toString().padStart(2, '0');
	const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;

	const getGablecData = async () => {
		// Fetch gableci
		const url = 'https://crepi-letido.eu/api/gablec-data';

		const document = await fetch(url);
		const json = await document.json();

		return json;
	};

	const mealSelectionData = readable(null, (set) => {
		processUserSelections().then((allSelectionData) => {
			// console.log({allSelectionData});
			supabase
				.from('meal-selections')
				.select()
				.eq('user', session?.user?.email)
				.gte('created', `${currentDate} 00:00:00`)
				.lte('created', `${currentDate} 23:59:59`)
				.select()
				.order('created')
				.maybeSingle()
				.then(({ data }) => {
					if (!data) {
						supabase
							.from('meal-selections')
							.insert({
								user: session?.user?.email,
								selected: {},
								final: false,
							})
							.select()
							.then(({ data: currentUserData }) => set({ currentUserData, allSelectionData }));
					} else {
						set({ currentUserData: data, allSelectionData });
					}
				});
		});

		const channel = supabase
			.channel('restaurantDataSub')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'meal-selections' }, ({ eventType, new: newRecord }) => {
				if (eventType === 'INSERT' || eventType === 'UPDATE') {
					processUserSelections().then((data) => {
						console.log({newRecord});

						const curr = get(mealSelectionData);

						set({
							currentUserData: newRecord,
							allSelectionData: data,
						})
					}
					);
				}
			})
			.subscribe();

		return () => supabase.removeChannel(channel);
	});

	const fetchResturantData = async (insert = true) => {
		const { data: allRestaurants } = await supabase.from('restaurants').select().eq('custom', 'FALSE').select('*', { count: 'exact' });
		const { data: initialData } = await supabase
			.from('meal-data')
			.select()
			.eq('valid', 'TRUE')
			.gte('created', `${currentDate} 00:00:00`)
			.lte('created', `${currentDate} 23:59:59`)
			.select('id,created,meals,restaurant:restaurants(*)');
		const { data: customRestaurantData } = await supabase.from('custom-meal-data').select('id,created,meals,restaurant:restaurants(*)');

		// console.log({initialData});

		if (initialData?.length < allRestaurants?.length) {
			const fetchedMappedData = await getGablecData();

			const validRestaurants = fetchedMappedData.filter(({ restaurant }) => allRestaurants.find(({ slug }) => slug === restaurant));

			console.log({validRestaurants, fetchedMappedData});

			if (validRestaurants.length < fetchedMappedData.length) {
				const invalidRestaurants = fetchedMappedData.filter((item) => !validRestaurants.includes(item));

				console.error({ invalidRestaurants });
			}

			if (insert) {
				const { data: newRecords } = await supabase.from('meal-data').insert(fetchedMappedData).select();

				if (Array.isArray(newRecords)) {
					return [...newRecords, ...customRestaurantData];
				}
			} else {
				return [...fetchedMappedData, ...customRestaurantData];
			}
		}

		return [...initialData, ...customRestaurantData];
	};

	const resturantData = readable(null, (set) => {
		fetchResturantData().then((data) => set(data));

		const channel = supabase
			.channel('restaurantDataSub')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'meal-data' }, ({ eventType, new: newRecord, old: oldRecord }) => {
				if (eventType === 'INSERT') {
					set([...(get(resturantData) ?? []), newRecord]);
				}

				if (eventType === 'UPDATE') {
					set(
						[...get(resturantData)].reduce((prev, curr) => {
							if (curr.id === oldRecord.id) {
								return [
									...prev,
									{
										...curr,
										meals: newRecord.meals,
									},
								];
							}

							return [...prev, curr];
						}, [])
					);
				}
			})
			.subscribe();

		return () => supabase.removeChannel(channel);
	});

	const processUserSelections = async () => {
		const rawRestaurantData = await fetchResturantData(false);

		const selectionData = rawRestaurantData.reduce((prev, { restaurant: { slug }, meals }) => {
			if (!meals) {
				return prev;
			}

			return {
				...prev,
				[slug]: Array.isArray(meals) ? meals.map(() => []) : [],
			};
		}, {});

		const { data: userSelections } = await supabase
			.from('meal-selections')
			// .select()
			// .eq("final", true)
			.select()
			.gte('created', `${currentDate} 00:00:00`)
			.lte('created', `${currentDate} 23:59:59`)
			.select('id,selected, user, userData:users(firstName,lastName,avatar)');

		// console.log({ rawRestaurantData, userSelections, selectionData });

		const refinedUserSelections = Object.entries(selectionData).reduce((prev, [restaurantName, restaurantMeals]) => {
			let restMealsCopy = [...restaurantMeals];

			userSelections.forEach((el) => {
				// console.log({sel: el.selected, sel2: el.selected?.[restaurantName], restaurantName});
				if (!el.selected[restaurantName]) {
					return;
				}
				el.selected[restaurantName]
					.map(({ meal }) => meal)
					.forEach((ind) => {
						if (!restMealsCopy[ind]?.includes(el.user)) {
							restMealsCopy[ind] = [...restMealsCopy[ind], el.user];
						}
					});
			});

			return {
				...prev,
				[restaurantName]: restMealsCopy,
			};
		}, {});

		const userData = userSelections.map(({ user, userData }) => ({
			...userData,
			email: user,
		}));
		const intersects = Object.entries(refinedUserSelections)
			.map(([restName, selections]) => {
				if (selections.some((s) => s.length === userData.length)) {
					return restName;
				}

				return null;
			})
			.filter(Boolean);

		return {
			selectionData: refinedUserSelections,
			userData,
			intersects,
		};
	};

	setContext('resturantData', resturantData);
	setContext('mealSelectionData', mealSelectionData);
</script>

<div class="p-10 pt-32">
	<div class="flex items-center gap-px mx-auto mb-4 w-fit">
		<Button disabled={$page.route.id === '/gableci/pick'} variant={$page.route.id === '/gableci/pick' ? 'default' : 'outline'} href="/gableci/pick" class="rounded-r-none">Pick-a-gablec</Button>
		<Button disabled={$page.route.id === '/gableci'} variant={$page.route.id === '/gableci' ? 'default' : 'outline'} class="rounded-l-none" href="/gableci">Svi odabiri</Button>
	</div>

	<slot />
</div>
