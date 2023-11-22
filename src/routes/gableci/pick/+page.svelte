<script>
	import GablecResults from '$lib/components/GablecResults.svelte';
	import GablecPicker from '$lib/components/GablecPicker.svelte';
	import * as Tabs from '$lib/components/ui/tabs';

	import { getContext } from 'svelte';

	const visibleTab = getContext('visibleTab');

	export let data;
	$: ({ supabase } = data);
</script>

<svelte:head>
	<title>Črepi letido | Gablec picker</title>
	<meta name="description" content="Ima li gladnih?" />
</svelte:head>

<GablecPicker {supabase} />

