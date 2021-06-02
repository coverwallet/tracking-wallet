Tracking wallet
========================

## v5
- removes `jquery` from the bundle. This may introduce some breaking changes in the projects which still rely on it. 
- suppor for Server Side Rendering (only uses `window` if it's available)
- recovered agent identification functionality from v4

Migrate from v3 to v4
--------------
- Remove calls to `timeEvent` method. The calls can stay but will fall back to an additional track event for the same event name ended in `_TIME_EVENT`
- Remove all references to `window.mixpanel` from the project

## Usage
ES6 Module:
```javascript
import TrackingWallet from 'tracking-wallet';

const trackingWallet = new TrackingWallet();
trackingWallet.identify('userId', { /* User traits */ });
trackingWallet.track({ /* Event */}, { /* Event options */});
```
or use the bundled version:

```html
<script type="text/javascript" src="<path>/dist/tracking-wallet.min.js"></script>
<script type="text/javascript">
    var trackingWallet = new window.TrackingWallet();
    trackingWallet.identify('userId', { /* User traits */ });
    trackingWallet.track({ /* Event */}, { /* Event options */});
</script>
```

- If `window.analytics` object is not ready before event is sent this event is stored in the queue and gets processed as soon as `window.analytics` is ready.

## Developement
You don't need to run a separate script to bundle the minified version of the code. It will be done automatically and added to your commit when you make changes in the `src` directory. 
