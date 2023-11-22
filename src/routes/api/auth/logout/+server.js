// @ts-nocheck
import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;
	const { error } = await supabase.auth.signOut();

	console.log({logOutError: error});

	throw redirect(303, '/');
};