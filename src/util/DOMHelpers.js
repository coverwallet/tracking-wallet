import "core-js/stable/url-search-params";

export const hasWindow = () => {
  return typeof window !== "undefined";
};

export const getCookieDomain = (host) => {
  const subdomains = host.split(".");
  return subdomains.length > 2
    ? subdomains.slice(-2).join(".")
    : window.location.host;
};

export const getDomainName = () =>
  window.location.host.match(/\.?([^.]+)\.[^.]+.?$/)[1];

export const getQueryParam = (key) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

export const checkReferrer = (refsList) =>
  refsList.some((refItem) => document.referrer.includes(refItem));
