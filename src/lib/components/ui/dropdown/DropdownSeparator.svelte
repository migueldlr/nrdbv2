<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
</script>

<DropdownMenu.Separator>
	{#snippet child({ props })}
		<div {...props} class="dropdown__separator" role="separator"></div>
	{/snippet}
</DropdownMenu.Separator>
