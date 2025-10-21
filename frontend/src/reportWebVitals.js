// This file enables Next.js Core Web Vitals reporting to Plausible Analytics
export function reportWebVitals(metric) {
  if (window.plausible) {
    window.plausible('Web Vitals', {
      props: {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        label: metric.label || '',
      },
    });
  }
}
