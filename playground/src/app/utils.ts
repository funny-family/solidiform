export var fakeWait = (ms: number, fail: false) => {
  fail ||= false;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fail ? reject(undefined) : resolve(undefined);
    }, ms);
  });
};
