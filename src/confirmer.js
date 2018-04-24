export const REJECTED = 'rejected';
export const CONFIRMED = 'confirmed';
export const CANCELLED = 'cancelled';

/**
 * The main class is referred to as `Confirmer` though the packaging is called
 * `confirmed` This is simply to prevent an NPM name collision but the proper
 * term for this utility is `Confirmer` and is referenced as such in this
 * documentation.
 */
class Confirmer {
  /**
   * Much like the `Promise` API the constructor for the `Confirmer` takes a
   * function. That function is passed a resolver object which has three
   * functions on it that you can use to *fulfill* the `Confirmer`, one
   * function to register an error, and a disposer function to clean up
   * resources is needed. Each fulfillment function can take an optional value.
   *
   * #### Example
   * ```js
   * new Confirmer(function (resolver) {
   *   // Affirm confirmation
   *   resolver.confirm();
   *   // Reject confirmation
   *   resolver.reject();
   *   // Cancel confirmation
   *   resolver.cancel();
   *   // Reject with an Error
   *   resolver.error(new Error());
   *   // Register a disposer function to clean up resources
   *   // Same as onDone but in the initializer function closure
   *   resolver.dispose(function () { … });
   * });
   * ```
   *
   * @param {Function} initFn The initializer function
   */
  constructor(initFn) {
    let disposer = () => {};
    if (!Confirmer.Promise) {
      throw new Error('You must provide a Promise implementation by assigning Confirmer.Promise');
    }
    this._promise = new Confirmer.Promise((resolve, reject) => {
      initFn({
        error: reject,
        reject: value => resolve({reason: REJECTED, value}),
        confirm: value => resolve({reason: CONFIRMED, value}),
        cancel: value => resolve({reason: CANCELLED, value}),
        dispose: fn => disposer = fn
      });
    }).then(
      result => Confirmer.Promise.resolve(disposer()).then(() => result),
      error => Confirmer.Promise.resolve(disposer()).then(() => { throw error; })
    );
  }

  /**
   * Register callback that is called when `resolver.confirm()` is triggered.
   * Used to denote that the user has confirmed in some way. ("OK" button,
   * correct login credentials, etc.)
   *
   * If the callback returns a new Confirmer the result will be that new
   * Confirmer allowing the callback to change the fulfillment reason as part
   * of the chaining. If it is simply a scalar value the fulfillment reason
   * with remain the same but the value will change.
   *
   * @param {Function} fn callback function called when Confirmer is confirmed
   * @return {Confirmer} A new Confirmer instance for chaining
   */
  onConfirmed(fn) {
    let promise = this._promise.then(result => {
      if (result.reason !== CONFIRMED) { return result; }
      let newValue = fn(result.value);
      if (newValue instanceof Confirmer) { return newValue._promise; }
      return Confirmer.Promise.resolve(newValue).then(value => {
        return { reason: CONFIRMED, value };
      });
    });
    return Confirmer.resolve(promise);
  }

  /**
   * Register callback that is called when `resolver.rejected()` is triggered.
   * Used to denote that the user has performed an action that denied the
   * confirmation. ("No" button, bad password, etc.)
   *
   * If the callback returns a new Confirmer the result will be that new
   * Confirmer allowing the callback to change the fulfillment reason as part
   * of the chaining. If it is simply a scalar value the fulfillment reason
   * with remain the same but the value will change.
   *
   * @param {Function} fn callback function called when Confirmer is rejected
   * @return {Confirmer} A new Confirmer instance for chaining
   */
  onRejected(fn) {
    let promise = this._promise.then(result => {
      if (result.reason !== REJECTED) { return result; }
      let newValue = fn(result.value);
      if (newValue instanceof Confirmer) { return newValue._promise; }
      return Confirmer.Promise.resolve(newValue).then(value => {
        return { reason: REJECTED, value };
      });
    });
    return Confirmer.resolve(promise);
  }

  /**
   * Register callback that is called when `resolver.cancel()` is triggered.
   * Used to denote that the confirmation was cancelled and perhaps should do
   * nothing.
   *
   * If the callback returns a new Confirmer the result will be that new
   * Confirmer allowing the callback to change the fulfillment reason as part
   * of the chaining. If it is simply a scalar value the fulfillment reason
   * with remain the same but the value will change.
   *
   * @param {Function} fn callback function called when Confirmer is cancelled
   * @return {Confirmer} A new Confirmer instance for chaining
   */
  onCancelled(fn) {
    let promise = this._promise.then(result => {
      if (result.reason !== CANCELLED) { return result; }
      let newValue = fn(result.value);
      if (newValue instanceof Confirmer) { return newValue._promise; }
      return Confirmer.Promise.resolve(newValue).then(value => {
        return { reason: CANCELLED, value };
      });
    });
    return Confirmer.resolve(promise);
  }

  /**
   * Spelling error; use `onCancelled`.
   * @deprecated
   */
  onCanceled(fn) {
    return this.onCancelled(fn);
  }

  /**
   * Register a callback that is called when any of the resolver functions are
   * triggered. This is used for clean up like closing the dialog and removing
   * stale event handlers. This is also called if the `resolver.error()` is
   * triggered or something throws an exception in the initialization function
   * (which can be captured by the `catch()` function just like a promise).

   * @param {Function} fn callback function called when Confirmer is resolved/errored
   * @return {Confirmer} A new Confirmer instance for chaining
   */
  onDone(fn) {
    let promise = this._promise.then(
      result => Confirmer.Promise.resolve(fn()).then(() => result),
      error => Confirmer.Promise.resolve(fn()).then(() => { throw error; })
    );
    return Confirmer.resolve(promise);
  }

  /**
   * Cast to a `Promise`. Will proxy to the internal promise `then()` method.
   * Since the result is a Promise it will not chain as Confirmer after this.
   *
   * The result of a fulfilled promise is an Object with `reason` and `value`
   * properties. See {@link Confirmer.resolve} for more details of this
   * internal object.
   *
   * @param {Function} onFulfilled callback when internal promise is fulfilled
   * @param {Function} onRejected  callback when internal promise is rejected
   * @return {Promise}
   */
  then() {
    return this._promise.then(...arguments);
  }

  /**
   * Cast to a `Promise`. Will proxy to the internal promise `catch()` method.
   * Since the result is a Promise it will not chain as Confirmer after this.
   *
   * @param {Function} onRejected  callback when internal promise is rejected
   * @return {Promise}
   */
  catch(fn) {
    return this._promise.then(null, fn);
  }

  /**
   * Low level utility to construct a new `Confirmer` with a fulfillment. It is
   * designed to easily wrap the internal promise/resolution in a `Confirmer`
   * object.
   *
   * * if a `Confirmer` is passed it will be returned
   * * if a `Promise` is passed it will become the internal promise of a new Confirmer
   * * if an `Object` is passed it will become the fulfilled value of the internal promise of a new Confirmer
   *
   * **Warning:** Any other type will cause the Confirmer to reject with an
   * error.
   *
   * The internal fulfillment value (either directly of as the result of a
   * promise resolution) must be an Object with these properties:
   *
   * * reason `String` - the reason for the fulfillment. One of "confirmed", "cancelled", or "rejected".
   * * value `Any` - the value associated (optional)
   *
   * @param {Confirmer|Promise|Object} result the result the new Confirmer should resolve to
   * @return {Confirmer} a new Confirmer that has/will be resolved to the result
   */
  static resolve(result) {
    if (result instanceof Confirmer) { return result; }
    let newConfirmer = new Confirmer(() => {});
    newConfirmer._promise = Confirmer.Promise.resolve(result).then(result => {
      let reason = result && result.reason;
      if (![CONFIRMED, CANCELLED, REJECTED].includes(reason)) {
        throw new Error(`Unknown resolution reason ${reason}`);
      }
      return result;
    });
    return newConfirmer;
  }
}

/**
 * The Promise constructor this library uses. Overwite this to change the
 * underlying Promise implementation if needed.
 *
 * @property Promise
 * @type Promise
 * @default Promise
 * @private
 */
if (typeof(Promise) !== 'undefined' && Promise != null) {
  Confirmer.Promise = Promise;
}

export default Confirmer;
