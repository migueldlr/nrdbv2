<div class="loading" role="status" aria-label="Loading"></div>

<style>
	.loading {
		animation: spin 800ms linear infinite;
		height: 6rem;
		width: 6rem;
		border-radius: 100%;
		border: 1rem solid color-mix(in oklab, currentColor 20%, transparent);
		border-top: 1rem solid currentColor;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
