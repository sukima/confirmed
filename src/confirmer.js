export const REJECTED = 'rejected';
export const CONFIRMED = 'confirmed';
export const CANCELLED = 'cancelled';

export default class Confirmer {
  constructor(initFn) {
    let disposer = () => {};
    this._promise = new Promise((resolve, reject) => {
      initFn({
        error: reject,
        reject: value => resolve({reason: REJECTED, value}),
        confirm: value => resolve({reason: CONFIRMED, value}),
        cancel: value => resolve({reason: CANCELLED, value}),
        dispose: fn => disposer = fn
      });
    }).then(
      result => Promise.resolve(disposer()).then(() => result),
      error => Promise.resolve(disposer()).then(() => { throw error; })
    );
  }

  onConfirmed(fn) {
    let promise = this._promise.then(result => {
      if (result.reason !== CONFIRMED) { return result; }
      let newValue = fn(result.value);
      return newValue instanceof Confirmer
        ? newValue._promise
        : {reason: CONFIRMED, value: newValue};
    });
    return Confirmer.resolve(promise);
  }

  onRejected(fn) {
    let promise = this._promise.then(result => {
      if (result.reason !== REJECTED) { return result; }
      let newValue = fn(result.value);
      return newValue instanceof Confirmer
        ? newValue._promise
        : {reason: REJECTED, value: newValue};
    });
    return Confirmer.resolve(promise);
  }

  onCancelled(fn) {
    let promise = this._promise.then(result => {
      if (result.reason !== CANCELLED) { return result; }
      let newValue = fn(result.value);
      return newValue instanceof Confirmer
        ? newValue._promise
        : {reason: CANCELLED, value: newValue};
    });
    return Confirmer.resolve(promise);
  }

  onCanceled(fn) {
    return this.onCancelled(fn);
  }

  onDone(fn) {
    let promise = this._promise.then(
      result => Promise.resolve(fn()).then(() => result),
      error => Promise.resolve(fn()).then(() => { throw error; })
    );
    return Confirmer.resolve(promise);
  }

  then() {
    return this._promise.then(...arguments);
  }

  catch(fn) {
    return this._promise.then(null, fn);
  }

  static resolve(result) {
    if (result instanceof Confirmer) { return result; }
    let newConfirmer = new Confirmer(() => {});
    newConfirmer._promise = Promise.resolve(result).then(result => {
      let reason = result && result.reason;
      if (![CONFIRMED, CANCELLED, REJECTED].includes(reason)) {
        throw new Error(`Unknown resolution reason ${reason}`);
      }
      return result;
    });
    return newConfirmer;
  }
}
