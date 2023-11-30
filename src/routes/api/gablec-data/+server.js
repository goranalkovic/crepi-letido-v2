// @ts-nocheck
import { json } from '@sveltejs/kit';
import { parse } from 'node-html-parser';

export const GET = async () => {
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

	return json(allRestaurantElements
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
							name: 'Ideme tamo! (Lignje pa doma™)',
							hasTopSeparator: true,
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

			if (output.restaurant === 'restoran-fontana-crnkovic') {
				output = {
					...output,
					meals: [
						...output.meals,
						{
							name: 'Pizza capricciosa',
							price: '5€',
							hasTopSeparator: true,
						},
						{
							name: 'Svježi sir s vrhnjem',
							price: '4€',
						},
						{
							name: 'Bistra juha s domaćim krpicama',
						},
						{
							name: 'Salate (kupus kisela, zelena, miješana)',
							price: '0.80€ - 1€',
							hasCustomText: true,
							isCustomItem: true,
						},
						{
							name: 'Dodaci (kečap, majoneza, senf, feferoni, tartar, ...)',
							price: '0.60€ - 0.80€',
							hasCustomText: true,
							isCustomItem: true,
						},
					],
				};
			}

			if (output.name?.length < 1 || output.slug?.length < 1 || output.meals?.length < 1) {
				return null;
			}

			return output;
		})
		.filter(Boolean));
};