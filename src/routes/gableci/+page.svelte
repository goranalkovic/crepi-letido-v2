<script>
	import GablecResults from '$lib/components/GablecResults.svelte';

	export let data;
	$: ({ supabase } = data);
</script>

<svelte:head>
	<title>Črepi letido | Kaj smo si zeli</title>
	<meta name="description" content="Ima li gladnih?" />
</svelte:head>

<GablecResults />

