<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: class_list = '' }: Props = $props();
</script>

<svg class={class_list} viewBox="0 0 100 100">
	<rect x="15" y="15" width="70" height="70" />
	<rect x="15" y="15" width="70" height="70" transform="rotate(45 50 50)" />
</svg>
