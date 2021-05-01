Tracking wallet
========================

## v4
`v5` removes `jquery` from the bundle. This may introduce some breaking changes in the projects which still rely on it. Check `v4` git branch for the old version. 

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
