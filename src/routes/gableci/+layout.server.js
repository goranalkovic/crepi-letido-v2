// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import { readable, get } from 'svelte/store';

export const load = async (data) => {
	const session = await data.locals.getSession();

	if (!session) {
		throw redirect(301, '/');
	}
}