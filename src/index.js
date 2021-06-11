import { get as getCookie, set as setCookie } from "js-cookie";
import { get } from "lodash-es";

import pollOnCallback from "./util/pollOnCallback";
import { isAnalyticsSnippetsLoaded, isGtmLoaded } from "./util/snippetsStatus";
import { getCookieDomain, hasWindow } from "./util/DOMHelpers";
import {
  ANALYTICS_SNIPPETS_POLL_INTERVAL,
  ANALYTICS_SNIPPETS_POLL_MAX_ATTEMPTS,
  ANALYTICS_SNIPPETS_PENDING,
  ANALYTICS_SNIPPETS_SUCCESS,
  ANALYTICS_SNIPPETS_FAILURE,
  CW_VISITED_BEFORE_COOKIE,
  AGENT_VALUE,
} from "./util/constants";
import isAgent from "./util/isAgent";

export const DEFAULT_TRACKING_WALLET_CONFIG = {
  checkLastAttrs: true,
};

export const DEFAULT_ANALYTICS_CONFIG = {
  cookie_expiration: 1825, // Time in days = 5 Years,
};

export default class TrackingWallet {
  constructor({ config = {} } = {}) {
    this.config = { ...DEFAULT_TRACKING_WALLET_CONFIG, ...config };
    this.snippetsStatus = ANALYTICS_SNIPPETS_PENDING;
    this.delayedCalls = [];
    pollOnCallback({
      onSuccess: () => {
        this.snippetsStatus = ANALYTICS_SNIPPETS_SUCCESS;
        if (hasWindow()) {
          window.analytics.ready(() => this.onAnalyticsReady());
        }
      },
      onFailure: () => {
        this.snippetsStatus = ANALYTICS_SNIPPETS_FAILURE;
        this.delayedCalls = [];
      },
      getCondition: isAnalyticsSnippetsLoaded,
      interval: ANALYTICS_SNIPPETS_POLL_INTERVAL,
      maxAttempts: ANALYTICS_SNIPPETS_POLL_MAX_ATTEMPTS,
    });
  }

  onAnalyticsReady() {
    this.setFirstTouchUTMTags();
    if (this.delayedCalls.length > 0) {
      this.delayedCalls.forEach((call) => call());
      this.delayedCalls = [];
    }
  }

  identify(userId, userTraits = {}) {
    if (this.snippetsStatus === ANALYTICS_SNIPPETS_FAILURE) return;
    if (this.snippetsStatus === ANALYTICS_SNIPPETS_PENDING) {
      this.delayedCalls.push(this.identify.bind(this, userId, userTraits));
      return;
    }
    if (!userId) return;
    if (hasWindow()) {
      window.analytics.identify(userId, userTraits);
    }
  }

  alias(userId) {
    if (this.snippetsStatus === ANALYTICS_SNIPPETS_FAILURE) return;
    if (this.snippetsStatus === ANALYTICS_SNIPPETS_PENDING) {
      this.delayedCalls.push(this.alias.bind(this, userId));
      return;
    }

    const { userId: existingUserId, anonymousId } = this.getAnalyticsUser();
    if (
      (!existingUserId || anonymousId === existingUserId) &&
      !isAgent() &&
      hasWindow()
    ) {
      window.analytics.alias(userId, anonymousId);
    }
  }

  page() {
    if (this.snippetsStatus === ANALYTICS_SNIPPETS_FAILURE) return;
    if (this.snippetsStatus === ANALYTICS_SNIPPETS_PENDING) {
      this.delayedCalls.push(this.page.bind(this));
      return;
    }
    if (hasWindow()) {
      window.analytics.page();
    }
  }

  track(event, props = {}) {
    if (this.snippetsStatus === ANALYTICS_SNIPPETS_FAILURE && !isAgent())
      return;

    const eventProps = { ...props };
    if (isAgent()) {
      eventProps.userRole = AGENT_VALUE;
    }

    if (this.snippetsStatus === ANALYTICS_SNIPPETS_PENDING) {
      this.delayedCalls.push(this.track.bind(this, event, eventProps));
      return;
    }
    if (!hasWindow()) {
      return;
    }

    window.analytics.track(event, eventProps);

    if (isGtmLoaded()) {
      window.dataLayer.push({ event, ...eventProps });
    }
  }

  setFirstTouchUTMTags() {
    if (getCookie(CW_VISITED_BEFORE_COOKIE)) return;
    if (!hasWindow()) {
      return;
    }

    const domain = getCookieDomain(window.location.host);
    setCookie(CW_VISITED_BEFORE_COOKIE, true, { expires: 365, domain });
  }

  getAnalyticsUser() {
    if (!hasWindow()) {
      return {};
    }

    const userGetter = get(window, "analytics.user", () => {})() || {};
    return {
      userId: typeof userGetter.id === "function" ? userGetter.id() : null,
      anonymousId:
        typeof userGetter.anonymousId === "function"
          ? userGetter.anonymousId()
          : null,
      userTraits:
        typeof userGetter.traits === "function" ? userGetter.traits() : {},
      setUserTraits: userGetter.traits,
    };
  }

  resetTraits() {
    if (this.snippetsStatus === ANALYTICS_SNIPPETS_FAILURE) return;
    if (this.snippetsStatus === ANALYTICS_SNIPPETS_PENDING) {
      this.delayedCalls.push(this.track.bind(this));
      return;
    }
    if (hasWindow()) {
      window.analytics.user().traits({});
    }
  }
}