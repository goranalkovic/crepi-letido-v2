<script>
	import { Button } from '$lib/components/ui/button';
	import { Construction } from 'lucide-svelte';
</script>

<div class="flex flex-col items-center justify-center h-screen max-w-lg p-10 mx-auto">
	<Construction class="w-10 h-10 opacity-40" />
	<h1 class="mt-2 text-4xl font-extrabold tracking-tight select-none scroll-m-20 lg:text-5xl">
		Črepi in progress
	  </h1>
	<Button href="/" variant="outline" size="lg" class="mt-8">Vrni me nazad</Button>
</div>
