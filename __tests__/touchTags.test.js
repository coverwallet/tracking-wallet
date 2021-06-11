import * as touchTags from "./touchTags";
import * as DOMHelpers from "../src/util/DOMHelpers";

describe("getTouchSource", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return utm_medium if it exists in url param", () => {
    DOMHelpers.getQueryParam = jest.fn().mockReturnValueOnce("test_medium");
    const touchSource = touchTags.getTouchSource();

    expect(touchSource).toEqual("test_medium");
  });

  it('should return "social" when comes from social networks', () => {
    DOMHelpers.getQueryParam = jest.fn().mockReturnValueOnce(null);
    jest
      .spyOn(global.document, "referrer", "get")
      .mockReturnValue("https://www.facebook.com");
    const touchSource = touchTags.getTouchSource();

    expect(touchSource).toEqual("social");
  });

  it('should return "seo" when comes from search engine', () => {
    DOMHelpers.getQueryParam = jest.fn().mockReturnValueOnce(null);
    jest
      .spyOn(global.document, "referrer", "get")
      .mockReturnValue("https://www.google.com");
    const touchSource = touchTags.getTouchSource();

    expect(touchSource).toEqual("seo");
  });

  it('should return "referral" if comes from other source', () => {
    DOMHelpers.getQueryParam = jest.fn().mockReturnValueOnce(null);
    jest
      .spyOn(global.document, "referrer", "get")
      .mockReturnValue("https://www.example.com");
    const touchSource = touchTags.getTouchSource();

    expect(touchSource).toEqual("referral");
  });

  it('should return "$direct" if comes directly', () => {
    DOMHelpers.getQueryParam = jest.fn().mockReturnValueOnce(null);
    jest.spyOn(global.document, "referrer", "get").mockReturnValue("");
    const touchSource = touchTags.getTouchSource();

    expect(touchSource).toEqual("$direct");
  });
});

jest.mock("../src/util/DOMHelpers", () =>
  jest.requireActual("../src/util/DOMHelpers")
);
