export const isGtmLoaded = () => !!(window.dataLayer && window.dataLayer.push);

export const isAnalyticsSnippetsLoaded = () => {
  return !!window.analytics;
};
