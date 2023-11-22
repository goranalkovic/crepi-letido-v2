<script>
	// @ts-nocheck
	import { setContext } from 'svelte';
	import { readable, get, writable } from 'svelte/store';
	import { parse } from 'node-html-parser';

	export let data;
	$: ({ supabase, session } = data);

	const getGablecData = async () => {
		// Fetch gableci
		const url = 'https://gableci.hr/vz/';

		const document = await fetch(url);
		const rawDocument = await document.text();

		const root = parse(rawDocument, {
			lowerCaseTagName: false,
			comment: false,
			voidTag: {
				tags: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'],
				closingSlash: true,
			},
			blockTextElements: {
				script: true,
				noscript: true,
				style: true,
				pre: true,
			},
		});

		const allRestaurantElements = root.querySelectorAll('.restoran');

		return allRestaurantElements
			.map((restaurant) => {
				const titleRaw = restaurant.querySelector('.main-restoran-title');
				const mealsRaw = restaurant.querySelector('ul.list-jela');
				const metaRaw = restaurant.querySelector('.restoran__meta');

				let output = {
					valid: true,
					restaurant: titleRaw?.getAttribute('href')?.replace('https://gableci.hr/restoran', '').replaceAll('/', ''),
					meals: mealsRaw
						?.querySelectorAll('li.food-type')
						?.map((mealData) => {
							const rawPrice = mealData.querySelector('.cijena');

							if (!rawPrice) {
								return null;
							}

							const isVegetarian = mealData?.classList?.contains('food-type--vegetarijansko');
							const isVegan = mealData?.classList?.contains('food-type--vegetarijansko');

							return {
								name: mealData.querySelector('.naziv-jela')?.innerText?.trim(),
								price: rawPrice?.innerText?.trim(),
								meta: {
									isVegetarian: isVegetarian,
									isVegan: isVegan,
								},
							};
						})
						.filter(Boolean)
						.filter(({ name, price }) => Boolean(name) && Boolean(price)),
				};

				if (output.restaurant === 'coral-croatia') {
					output = {
						...output,
						meals: [
							...output.meals,
							{
								name: 'Omlet sa sirom s prženim krumpirićima + salata',
								price: '3.32€',
								meta: {
									isVegetarian: true,
									isVegan: false,
								},
								hasTopSeparator: true,
							},
							{
								name: 'Šopska salata',
								price: '3.10€',
								meta: {
									isVegetarian: true,
									isVegan: false,
								},
							},
							{
								name: 'Salata s prženom piletinom (Sportska salata)',
								price: '4.00€',
								meta: {
									isVegetarian: false,
									isVegan: false,
								},
							},
							{
								name: 'Miješano meso sa žara s prženim krumpirićima',
								price: '8.30€',
								meta: {
									isVegetarian: false,
									isVegan: false,
								},
							},
							{
								name: 'Pileća prsa s prženim krumpirićima + salata',
								price: '6.80€',
								meta: {
									isVegetarian: false,
									isVegan: false,
								},
							},
							{
								name: 'Pohani sir s prženim krumpirićima + salata',
								price: '5.60€',
								meta: {
									isVegetarian: true,
									isVegan: false,
								},
							},
							{
								name: 'Pljeskavica s prženim krumpirićima + salata',
								price: '6.60€',
								meta: {
									isVegetarian: false,
									isVegan: false,
								},
							},
							{
								name: 'Zagrebački odrezak s prženim krumpirićima + salata',
								price: '6.00€',
								meta: {
									isVegetarian: false,
									isVegan: false,
								},
							},
							{
								name: 'Hamburger s prženim krumpirićima',
								price: '5.00€',
								meta: {
									isVegetarian: false,
									isVegan: false,
								},
							},
							{
								name: 'Cheeseburger s prženim krumpirićima',
								price: '5.30€',
								meta: {
									isVegetarian: false,
									isVegan: false,
								},
							},
							{
								name: 'Pržene lignje s prženim krumpirićima',
								price: '7.30€',
								meta: {
									isVegetarian: false,
									isVegan: false,
								},
							},
							{
								name: 'Ideme tamo! (aka <i>Lignje pa doma</i>)',
								hasTopSeparator: true,
								isCustomItem: true,
							},
						],
					};
				}

				if (output.restaurant === 'restoran-august') {
					output = {
						...output,
						meals: [
							...output.meals,
							{
								name: 'Nekaj z dodatne ponude',
								meta: {
									isVegetarian: false,
									isVegan: false,
								},
								isCustomItem: true,
								hasCustomText: true,
							},
						],
					};
				}

				if (output.name?.length < 1 || output.slug?.length < 1 || output.meals?.length < 1) {
					return null;
				}

				return output;
			})
			.filter(Boolean);
	};

	const mealSelectionData = readable(null, (set) => {
		processUserSelections().then((allSelectionData) => {
			supabase
				.from('meal-selections')
				.select()
				.eq('user', session?.user?.email)
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
					processUserSelections().then((data) => set({
						currentUserData: newRecord,
						allSelectionData: data,
					}));
				}
			})
			.subscribe();

		return () => supabase.removeChannel(channel);
	});

	const fetchResturantData = async () => {
		const { data: initialData } = await supabase.from('meal-data').select().eq('valid', 'TRUE').select('id,created,meals,restaurant:restaurants(*)');

		const { data: allRestaurants } = await supabase.from('restaurants').select('*', { count: 'exact' });

		if (initialData.length < allRestaurants?.length) {
			const fetchedMappedData = await getGablecData();

			const validRestaurants = fetchedMappedData.filter(({ restaurant }) => allRestaurants.find(({ slug }) => slug === restaurant));

			if (validRestaurants.length < fetchedMappedData.length) {
				const invalidRestaurants = fetchedMappedData.filter((item) => !validRestaurants.includes(item));

				console.error({ invalidRestaurants });
			}

			const { data: newRecords } = await supabase.from('meal-data').insert(fetchedMappedData).select();

			if (Array.isArray(newRecords)) {
				return [...initialData, ...newRecords];
			}
		}

		return initialData;
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
		const rawRestaurantData = await fetchResturantData();

		if (!rawRestaurantData) {
			return;
		}

		const selectionData = rawRestaurantData.reduce((prev, { restaurant: { slug }, meals }) => {
			return {
				...prev,
				[slug]: meals?.length > 0 ? Array(meals.length).fill([]) : [],
			};
		}, {});




		const { data: userSelections } = await supabase.from('meal-selections').select().eq('final', true).select('id,selected, user, userData:users(firstName,lastName,avatar)');

		console.log({rawRestaurantData, userSelections, selectionData});

		const refinedUserSelections = Object.entries(selectionData).reduce((prev, [restaurantName, restaurantMeals]) => {
			let restMealsCopy = [...restaurantMeals];



			userSelections.forEach((el) => {
				// console.log({sel: el.selected, sel2: el.selected?.[restaurantName], restaurantName});
				if (!el.selected[restaurantName]) {
					return;
				}
				el.selected[restaurantName].map(({meal}) => meal).forEach((ind) => {
					if (!restMealsCopy[ind]?.includes(el.user)) {
						restMealsCopy[ind] = [...restMealsCopy[ind], el.user];
					}
				});
			});

			return {
				...prev,
				[restaurantName]: restMealsCopy,
			}
		}, {});

		const userData = userSelections.map(({ user, userData }) => ({ ...userData, email: user }));
		const intersects = Object.entries(selectionData).map(([restName, selections]) => {
				if (selections.some((s) => s.length === userData.length)) {
					return restName;
				}

				return null;
			}).filter(Boolean);

		return {
			selectionData: refinedUserSelections,
			userData,
			intersects,
		};
	};

	const visibleTab = writable('pick');

	setContext('resturantData', resturantData);
	setContext('visibleTab', visibleTab);
	setContext('mealSelectionData', mealSelectionData);
</script>

<slot />
