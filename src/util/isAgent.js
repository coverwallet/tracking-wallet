import { get as getCookie } from "js-cookie";
import { USER_ROLE_KEY_COOKIE, AGENT_VALUE } from "./constants";

export default function isAgent() {
  const cookie = getCookie(USER_ROLE_KEY_COOKIE);
  return cookie === AGENT_VALUE;
}
