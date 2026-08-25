<script>
	import { notif } from '$lib/stores/index';
	import gsap from 'gsap';
	let notification = $state();
	$effect(() => {
		notification = $notif;
		if (!$notif) return;
		gsap.killTweensOf('.notification');
		gsap.fromTo(
			'.notification',
			{ x: 0, opacity: 0, scale: 0.95 },
			{
				x: -280,
				opacity: 1,
				scale: 1,
				duration: 0.45,
				ease: 'power3.out',
				onComplete: () => {
					gsap.to('.notification', {
						x: 0,
						opacity: 0,
						scale: 0.95,
						duration: 0.3,
						delay: 2,
						ease: 'power2.in'
					});
				}
			}
		);
	});
</script>

<div class="notification"><p>{notification}</p></div>

<style>
	.notification {
		position: absolute;
		min-width: 135px;
		max-width: 220px;
		padding: 12px 16px;
		border-radius: 12px;
		right: -280px;
		margin: 35px 10px;
		background-color: var(--color-bg);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		opacity: 0;
		z-index: 10000;
	}

	.notification p {
		margin: 0;
		line-height: 1.4;
	}
</style>
