import { ref, onUnmounted } from 'vue';

export function useChartAnimation(duration: number = 1500) {
  const animatedValue = ref(0);
  let animationFrame: number | null = null;

  function animateTo(target: number) {
    const start = animatedValue.value;
    const startTime = performance.now();

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      animatedValue.value = Math.round(start + (target - start) * easeProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(update);
      }
    }

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }
    animationFrame = requestAnimationFrame(update);
  }

  onUnmounted(() => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }
  });

  return { animatedValue, animateTo };
}
