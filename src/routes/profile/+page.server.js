// @ts-nocheck
import { redirect } from '@sveltejs/kit';

export const actions = {
	updateUser: async (event) => {
		const { request, url, locals: { supabase, session } } = event
		const formData = await request.formData()

		const email = formData.get('email') ?? '';
		const firstName = formData.get('firstName') ?? '';
		const lastName = formData.get('lastName') ?? '';
		const avatar = formData.get('avatar') ?? '';

		await supabase.from('users').upsert({
			email,
			firstName,
			lastName,
			avatar,
		});

		throw redirect(301, '/');
	}
}