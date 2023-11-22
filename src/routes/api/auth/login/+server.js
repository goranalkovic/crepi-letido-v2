// @ts-nocheck
import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;
	const userEmail = url.searchParams.get('user');

	if (userEmail) {
		const { data, error } = await supabase.auth.signInWithOtp({
			email: userEmail,
			options: {
				// set this to false if you do not want the user to be automatically signed up
				shouldCreateUser: true,
				emailRedirectTo: '/profile', // `${url.protocol}//${url.host}/auth/confirm?next=/gableci`,
			},
		})

		console.log({ data, error });

		if (!error) {
			throw redirect(303, `/`);
		}
	}

	// return the user to an error page with some instructions
	throw redirect(303, '/');
};