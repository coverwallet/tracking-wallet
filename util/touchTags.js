import { get as getCookie } from "js-cookie";

import { getQueryParam, checkReferrer } from "./DOMHelpers";
import { capitalizeUTM } from "./utmFormat";
import {
  LAST_PARTNER_COOKIE,
  SOCIAL_REFERRERS,
  SEO_REFERRERS,
  CAMPAIGN_KEYWORDS,
} from "./constants";

export const getTouchSource = () => {
  const utmMedium = getQueryParam("utm_medium");
  if (utmMedium) return utmMedium;
  if (checkReferrer(SOCIAL_REFERRERS)) return "social";
  if (checkReferrer(SEO_REFERRERS)) return "seo";
  if (document.referrer) return "referral";
  return "$direct";
};

export const getTouchTags = (prefix) => ({
  [`${prefix} Touch Source`]: getTouchSource(),
  [`${prefix} Partner`]: getCookie(LAST_PARTNER_COOKIE) || "CoverWallet",
});

export const getDefaultLastUTMTags = () => {
  const params = new URLSearchParams(window.location.search);
  const paramsKeys = Array.from(params.keys());
  return paramsKeys.reduce(
    (acc, param) =>
      CAMPAIGN_KEYWORDS.includes(param)
        ? {
            ...acc,
            [`Last ${capitalizeUTM(param)}`]: params.get(param),
          }
        : acc,
    {}
  );
};
