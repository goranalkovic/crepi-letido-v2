<script>
	// @ts-nocheck
	import { Cloud, CreditCard, Github, Keyboard, LifeBuoy, LogOut, Mail, MessageSquare, Plus, PlusCircle, Settings, User, UserPlus, Users } from 'lucide-svelte';

	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	export let user;

</script>

<DropdownMenu.Root positioning={{ placement: 'bottom-end' }}>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="icon" class="rounded-full">
			<Avatar.Root class="w-9 h-9">
				<Avatar.Image src="/profile-pictures/{user?.avatar ?? 'fallback'}.jpg" alt="{user?.firstName ?? ''} {user?.lastName ?? ''}" />
				<Avatar.Fallback>{user?.firstName?.charAt(0) ?? '-'}{user?.lastName?.charAt(0) ?? '-'}</Avatar.Fallback>
			</Avatar.Root>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Label>{user.email}</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item href="/profile">
			<User class="w-4 h-4 mr-2" />
			<span>Profile</span>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item href="/api/auth/logout">
			<LogOut class="w-4 h-4 mr-2" />
			<span>Log out</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
