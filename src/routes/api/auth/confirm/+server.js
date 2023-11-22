// @ts-nocheck
import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');
	const nextUrl = url.searchParams.get('next') ?? '/';

	if (token_hash && type) {
		const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

		console.log('CONFIRM');
		console.log({data, error});

		if (!error) {
			throw redirect(303, nextUrl);
		}
	}

	// return the user to an error page with some instructions
	throw redirect(303, '/');
};