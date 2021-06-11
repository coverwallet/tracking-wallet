export const isGtmLoaded = () =>
  !!(window && window.dataLayer && window.dataLayer.push);

export const isAnalyticsSnippetsLoaded = () => {
  return !!(window && window.analytics);
};
