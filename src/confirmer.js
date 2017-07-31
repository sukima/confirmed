export const REJECTED = 'rejected';
export const CONFIRMED = 'confirmed';
export const CANCELLED = 'cancelled';

export default class Confirmer {
  constructor(initFn) {
    this._promise = new Promise((resolve, reject) => {
      initFn({
        error: reject,
        reject: value => resolve({reason: REJECTED, value}),
        confirm: value => resolve({reason: CONFIRMED, value}),
        cancel: value => resolve({reason: CANCELLED, value})
      });
    });
  }

  onConfirmed(fn) {
    this._promise = this._promise.then(result => {
      if (result.reason === CONFIRMED) {
        result.value = fn(result.value);
      }
      return result
    });
    return this;
  }

  onRejected(fn) {
    this._promise = this._promise.then(result => {
      if (result.reason === REJECTED) {
        result.value = fn(result.value);
      }
      return result
    });
    return this;
  }

  onCancelled(fn) {
    this._promise = this._promise.then(result => {
      if (result.reason === CANCELLED) {
        result.value = fn(result.value);
      }
      return result
    });
    return this;
  }

  onDone(fn) {
    this._promise = this._promise.then(
      result => {
        fn();
        return result;
      },
      error => {
        fn();
        throw error;
      }
    );
    return this;
  }

  then() {
    return this._promise.then(...arguments);
  }

  catch(fn) {
    return this._promise.then(null, fn);
  }
}
