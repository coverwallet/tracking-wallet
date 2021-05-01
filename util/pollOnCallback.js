export default function pollOnCallback({
  onSuccess,
  onFailure,
  getCondition,
  maxAttempts = 10,
  interval = 100,
}) {
  let attempts = 0;
  const checkCondition = (resolve) => {
    attempts += 1;
    if (getCondition()) {
      resolve(onSuccess());
    } else if (attempts <= maxAttempts) {
      setTimeout(checkCondition, interval, resolve);
    } else {
      onFailure();
    }
  };
  return new Promise(checkCondition);
}
