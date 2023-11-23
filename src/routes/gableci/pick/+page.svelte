<script>
	import GablecPicker from '$lib/components/GablecPicker.svelte';

	export let data;
	$: ({ supabase, session } = data);
</script>

<svelte:head>
	<title>Črepi letido | Gablec picker</title>
	<meta name="description" content="Ima li gladnih?" />
</svelte:head>

<GablecPicker {supabase} {session} />

