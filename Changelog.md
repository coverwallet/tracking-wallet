# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2020-03-23

### Removed
- Mixpanel dependencies

### Deprecated

- `timeEvent` method. It will fallback to a track event of the same event name ended in `_TIME_EVENT`, eg. `trackingWallet.timeEvent("ANY_ACTION")` will not add the `Duration` property to the `ANY_ACTION` event but trigger a new event called `ANY_ACTION_TIME_EVENT` instead.

## [3.7.0] - 2021-03-23

### Added
- Checks if the user that uses Track is an Agent (looking for the value 'user-role' = 'agent' in his cookies), if that is TRUE, we add that field to the ObjectToSend, if is not, nothing is added.
- Adds a new check when a user makes an Alias, if is an Agent (looking for the value 'user-role' = 'agent' in his cookies), if that is TRUE, we skip that identify.
