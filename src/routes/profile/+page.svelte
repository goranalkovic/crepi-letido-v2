<script>
	// @ts-nocheck
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	export let data;
	$: ({ supabase, session } = data);

	let firstName = '';
	let lastName = '';
	let avatar = '';

	onMount(async () => {
		const { data } = await supabase.from('users').select().eq('email', session?.user?.email).maybeSingle();

		if (data) {
			firstName = data?.firstName ?? '';
			lastName = data?.lastName ?? '';
			avatar = data?.avatar ?? 'fallback';
		}
	});

	const avatarOptions = [
		{ value: 'aco', label: 'Aco Braco' },
		{ value: 'ceh', label: 'Čeh' },
		{ value: 'goc', label: 'Goc' },
		{ value: 'hrvoic', label: 'Hrvoić' },
		{ value: 'jurica', label: 'Jurica' },
		{ value: 'kanc', label: 'KancIvan' },
		{ value: 'my10', label: 'Majcen' },
		{ value: 'petarjadek', label: 'Petar' },
		{ value: 'ext1', label: 'Gost 1' },
		{ value: 'ext2', label: 'Gost 2' },
		{ value: 'ext3', label: 'Gost 3' },
		{ value: 'ext4', label: 'Gost 4' },
		{ value: 'ext5', label: 'Gost 5' },
	];
</script>

<div class="p-10 pt-32">
	<div class="mt-8 mb-4">
		<p class="text-lg font-semibold tracking-tight scroll-m-20 text-muted-foreground">Profil</p>
		<h2 class="text-3xl font-semibold tracking-tight transition-colors scroll-m-20">Predstavi se, budi svoj črep</h2>
	</div>

	<form action="?/updateUser" method="POST" class="mt-12 space-y-6">
		<div class="flex flex-col w-full max-w-xs gap-1.5">
			<Label for="firstName">First name</Label>
			<Input type="text" id="firstName" name="firstName" value={firstName} />
		</div>
		<div class="flex flex-col w-full max-w-xs gap-1.5">
			<Label for="lastName">First name</Label>
			<Input type="text" id="lastName" name="lastName" value={lastName} />
		</div>

		<div class="flex items-center justify-between w-full max-w-xs">
			<Label>Avatar</Label>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" class="flex items-center gap-2">
						<Avatar.Root class="w-6 h-6">
							<Avatar.Image src="/profile-pictures/{avatar}.jpg" alt="{firstName} {lastName}" />
							<Avatar.Fallback>{firstName?.charAt(0) ?? '-'}{lastName?.charAt(0) ?? '-'}</Avatar.Fallback>
						</Avatar.Root>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>Avatar</DropdownMenu.Label>
						<DropdownMenu.Separator />
						{#each avatarOptions.filter(({ value }) => !value.startsWith('ext')) as { label, value }}
							<DropdownMenu.Item on:click={() => (avatar = value)} class="flex items-center gap-3">
								<Avatar.Root class="w-6 h-6">
									<Avatar.Image src="/profile-pictures/{value}.jpg" alt={label} />
									<Avatar.Fallback>{value}</Avatar.Fallback>
								</Avatar.Root>
								{label}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<input type="hidden" name="avatar" value={avatar} />
		<input type="hidden" name="email" value={session?.user?.email} />

		<Button type="submit">Spremi</Button>
	</form>
</div>
