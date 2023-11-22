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
	<title>Črepi letido | Kaj smo si zeli</title>
	<meta name="description" content="Ima li gladnih?" />
</svelte:head>


<!-- <Tabs.Root value={$visibleTab}>
	<Tabs.List>
		<Tabs.Trigger value="pick">Odaberi</Tabs.Trigger>
		<Tabs.Trigger value="overview">Rezultati</Tabs.Trigger>
		<Tabs.Trigger value="vote" disabled>Glasaj (TODO)</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="pick">
		<GablecPicker {supabase} />
	</Tabs.Content>
	<Tabs.Content value="overview">
		
		Debugging in progress
	</Tabs.Content>
	<Tabs.Content value="vote">WIP</Tabs.Content>
</Tabs.Root> -->
<GablecResults />

