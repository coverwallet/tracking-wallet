/* eslint-disable no-await-in-loop */
import * as cookie from "js-cookie";
import * as tw from "../src/index.js";
import * as touchTags from "./touchTags";
import {
  ANALYTICS_SNIPPETS_POLL_INTERVAL,
  ANALYTICS_SNIPPETS_POLL_MAX_ATTEMPTS,
  ANALYTICS_SNIPPETS_PENDING,
  ANALYTICS_SNIPPETS_SUCCESS,
  ANALYTICS_SNIPPETS_FAILURE,
  CW_VISITED_BEFORE_COOKIE,
} from "../src/util/constants";

let twInstance;
const TrackingWallet = tw.default;
const MAX_ANALYTICS_LOADING_TIME =
  ANALYTICS_SNIPPETS_POLL_INTERVAL * ANALYTICS_SNIPPETS_POLL_MAX_ATTEMPTS;

describe("TrackingWallet", () => {
  beforeEach(() => {
    global.analytics = {
      ready: jest.fn(),
      identify: jest.fn(),
      alias: jest.fn(),
      track: jest.fn(),
      page: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should store default trackingWallet config merged custom on inti", () => {
    const config = { foo: "foo" };
    twInstance = new TrackingWallet({ config });

    expect(twInstance.config).toEqual({
      ...tw.DEFAULT_TRACKING_WALLET_CONFIG,
      ...config,
    });
  });

  it("should init if window.analytics loaded in 1 sec", async () => {
    global.analytics = undefined;

    setTimeout(() => {
      global.analytics = { ready: jest.fn() };
    }, MAX_ANALYTICS_LOADING_TIME);

    twInstance = new TrackingWallet();
    expect(twInstance.snippetsStatus).toEqual(ANALYTICS_SNIPPETS_PENDING);
    expect(global.analytics).toBeUndefined();

    for (let i = 0; i <= ANALYTICS_SNIPPETS_POLL_MAX_ATTEMPTS; i++) {
      jest.advanceTimersByTime(ANALYTICS_SNIPPETS_POLL_INTERVAL);
      // eslint-disable-next-line no-await-in-loop
      await Promise.resolve();
    }
    expect(twInstance.snippetsStatus).toEqual(ANALYTICS_SNIPPETS_SUCCESS);
    expect(global.analytics.ready).toHaveBeenCalled();
  });

  it("should not init if window.analytics not loaded in 1 sec", async () => {
    global.analytics = undefined;
    setTimeout(() => {
      global.analytics = { ready: jest.fn() };
    }, MAX_ANALYTICS_LOADING_TIME + 1);

    twInstance = new TrackingWallet();
    expect(twInstance.snippetsStatus).toEqual(ANALYTICS_SNIPPETS_PENDING);
    expect(global.analytics).toBeUndefined();

    for (let i = 0; i <= ANALYTICS_SNIPPETS_POLL_MAX_ATTEMPTS; i++) {
      jest.advanceTimersByTime(ANALYTICS_SNIPPETS_POLL_INTERVAL);
      await Promise.resolve();
    }
    expect(twInstance.snippetsStatus).toEqual(ANALYTICS_SNIPPETS_FAILURE);
    expect(global.analytics.ready).not.toHaveBeenCalled();
  });

  it("should store delayed calls if analytics not loaded in time", async () => {
    jest
      .spyOn(TrackingWallet.prototype, "setFirstTouchUTMTags")
      .mockImplementation(jest.fn());
    jest
      .spyOn(TrackingWallet.prototype, "setFirstTouchUTMTags")
      .mockImplementation(jest.fn());

    global.analytics = undefined;
    twInstance = new TrackingWallet();
    twInstance.identify();
    twInstance.track();
    expect(twInstance.delayedCalls).toHaveLength(2);

    setTimeout(() => {
      global.analytics = {
        ready: jest
          .fn()
          .mockImplementation(twInstance.onAnalyticsReady.bind(twInstance)),
        identify: jest.fn(),
        alias: jest.fn(),
        track: jest.fn(),
        page: jest.fn(),
      };
    }, MAX_ANALYTICS_LOADING_TIME);
    jest.advanceTimersByTime(MAX_ANALYTICS_LOADING_TIME + 100);
    await Promise.resolve();

    expect(twInstance.delayedCalls).toHaveLength(0);
  });

  it("should execute stored delayed calls after analytics loaded", async () => {
    const randomParam1 = { foo: "foo" };
    const randomParam2 = "random";
    const randomParam3 = "eventName";
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    jest
      .spyOn(TrackingWallet.prototype, "setFirstTouchUTMTags")
      .mockImplementation(jest.fn());
    jest
      .spyOn(TrackingWallet.prototype, "setFirstTouchUTMTags")
      .mockImplementation(jest.fn());

    global.analytics = undefined;
    twInstance = new TrackingWallet();
    twInstance.delayedCalls = [
      fn1.bind(twInstance, randomParam1),
      fn2.bind(twInstance, randomParam2, randomParam3),
    ];

    setTimeout(() => {
      global.analytics = {
        ready: jest
          .fn()
          .mockImplementation(twInstance.onAnalyticsReady.bind(twInstance)),
        identify: jest.fn(),
        alias: jest.fn(),
        track: jest.fn(),
        page: jest.fn(),
      };
    }, MAX_ANALYTICS_LOADING_TIME);
    jest.advanceTimersByTime(MAX_ANALYTICS_LOADING_TIME);
    await Promise.resolve();

    expect(fn1).toHaveBeenCalledWith(randomParam1);
    expect(fn2).toHaveBeenCalledWith(randomParam2, randomParam3);
  });

  it("should not execute stored delayed calls if analytics not loaded", async () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    jest
      .spyOn(TrackingWallet.prototype, "setFirstTouchUTMTags")
      .mockImplementation(jest.fn());
    jest
      .spyOn(TrackingWallet.prototype, "setFirstTouchUTMTags")
      .mockImplementation(jest.fn());

    global.analytics = undefined;
    twInstance = new TrackingWallet();
    twInstance.delayedCalls = [fn1, fn2];

    setTimeout(() => {
      global.analytics = {
        ready: jest
          .fn()
          .mockImplementation(twInstance.onAnalyticsReady.bind(twInstance)),
        identify: jest.fn(),
        alias: jest.fn(),
        track: jest.fn(),
        page: jest.fn(),
      };
    }, MAX_ANALYTICS_LOADING_TIME + 1);
    jest.advanceTimersByTime(MAX_ANALYTICS_LOADING_TIME + 1);
    await Promise.resolve();

    expect(twInstance.delayedCalls).toHaveLength(0);
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).not.toHaveBeenCalled();
  });

  it("should set utm params on analytics ready", () => {
    jest
      .spyOn(TrackingWallet.prototype, "setFirstTouchUTMTags")
      .mockImplementation(jest.fn());

    twInstance = new TrackingWallet();
    twInstance.onAnalyticsReady();

    expect(twInstance.setFirstTouchUTMTags).toHaveBeenCalled();
  });

  it("should not set first touch tags if CW-FirstTime cookie exists", () => {
    cookie.get = jest.fn().mockReturnValueOnce(true);
    cookie.set = jest.fn();

    twInstance = new TrackingWallet();
    twInstance.setFirstTouchUTMTags();

    expect(global.analytics.identify).not.toHaveBeenCalled();
    expect(cookie.set).not.toHaveBeenCalled();
  });

  it("should set first touch tags as superproperties if CW-FirstTime cookie does not exist", () => {
    const randomFirstTouch = { foo: "foo" };
    cookie.get = jest.fn().mockReturnValueOnce(undefined);
    touchTags.getTouchTags = jest.fn().mockReturnValueOnce(randomFirstTouch);

    twInstance = new TrackingWallet();
    twInstance.setFirstTouchUTMTags();

    expect(cookie.set).toHaveBeenCalledWith(CW_VISITED_BEFORE_COOKIE, true, {
      domain: "localhost",
      expires: 365,
    });
  });

  it("should be able to track events", () => {
    const randomEvent = "randomEvent";
    const randomProps = { foo: "foo" };

    twInstance = new TrackingWallet();
    twInstance.track(randomEvent, randomProps);

    expect(global.analytics.track).toHaveBeenCalledWith(
      randomEvent,
      randomProps
    );
  });

  it("should not identify anonymous user", () => {
    jest
      .spyOn(TrackingWallet.prototype, "getAnalyticsUser")
      .mockReturnValueOnce({ userId: null });

    twInstance = new TrackingWallet();
    twInstance.identify(null);

    expect(global.analytics.identify).not.toHaveBeenCalled();
  });

  it("should alias user if userId cookie does not exist", () => {
    jest
      .spyOn(TrackingWallet.prototype, "getAnalyticsUser")
      .mockReturnValueOnce({ userId: null, anonymousId: "anonymous_uuid" });

    twInstance = new TrackingWallet();
    twInstance.alias("random");

    expect(global.analytics.alias).toHaveBeenCalledWith(
      "random",
      "anonymous_uuid"
    );
  });

  it("should alias user if userId equals anonymousId", () => {
    jest
      .spyOn(TrackingWallet.prototype, "getAnalyticsUser")
      .mockReturnValueOnce({
        userId: "anonymous_uuid",
        anonymousId: "anonymous_uuid",
      });

    twInstance = new TrackingWallet();
    twInstance.alias("random");

    expect(global.analytics.alias).toHaveBeenCalledWith(
      "random",
      "anonymous_uuid"
    );
  });

  it("should not alias user if userId not equals anonymousId", () => {
    jest
      .spyOn(TrackingWallet.prototype, "getAnalyticsUser")
      .mockReturnValueOnce({
        userId: "user@mail.com",
        anonymousId: "anonymous_uuid",
      });

    twInstance = new TrackingWallet();
    twInstance.alias("random");

    expect(global.analytics.alias).not.toHaveBeenCalled();
  });

  it("should be able to track page", () => {
    twInstance = new TrackingWallet();
    twInstance.page();

    expect(global.analytics.page).toHaveBeenCalled();
  });

  it("should get analytics user anonymousId", () => {
    const anonymousIdMock = jest.fn().mockReturnValueOnce("random");
    global.analytics.user = jest.fn().mockReturnValueOnce({
      anonymousId: anonymousIdMock,
    });

    twInstance = new TrackingWallet();
    const { anonymousId } = twInstance.getAnalyticsUser();

    expect(global.analytics.user).toHaveBeenCalled();
    expect(anonymousIdMock).toHaveBeenCalled();
    expect(anonymousId).toEqual("random");
  });

  it("should get analytics user id", () => {
    const userIdMock = jest.fn().mockReturnValueOnce("randomUserID");
    global.analytics.user = jest.fn().mockReturnValueOnce({
      id: userIdMock,
    });

    twInstance = new TrackingWallet();
    const { userId } = twInstance.getAnalyticsUser();

    expect(global.analytics.user).toHaveBeenCalled();
    expect(userIdMock).toHaveBeenCalled();
    expect(userId).toEqual("randomUserID");
  });

  it("should get analytics user traits", () => {
    const randomTraits = { foo: "foo" };
    const traitsMock = jest.fn().mockReturnValueOnce(randomTraits);
    global.analytics.user = jest.fn().mockReturnValueOnce({
      traits: traitsMock,
    });

    twInstance = new TrackingWallet();
    const { userTraits } = twInstance.getAnalyticsUser();

    expect(global.analytics.user).toHaveBeenCalled();
    expect(traitsMock).toHaveBeenCalled();
    expect(userTraits).toEqual(randomTraits);
  });
});

jest.useFakeTimers();
jest.mock("js-cookie", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));
jest.mock("./touchTags");
