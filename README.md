# Confirmed

A framework agnostic asynchronous confirmation module.

A very simple *promise-like* API for easily showing a confirmation and
resolving to the result of the user input. Its main goal is to replace or
enhance the typical `window.confirm` and many adhoc event based solutions (see
example below).

Special thanks to [FunnelCloud Inc.](http://funnelcloud.io/) for graciously
providing inspiration, R+D, and support.

License: MIT

## Install

Node.js:

    npm install confirmed

OR

    yarn add confirmed

Browser:

```html
<script type="text/javascript" src="/path/to/module/dist/confirmer.js"></script>
```

The `dist/confirmer.js` is a UMD module compatible with Node.js, AMD
(require.js), and as a browser global.

## Requirements

This package uses promises. You environment will need to have a `Promise`
implementation. Most modern browsers and later versions of Node have such. If
you use this in an environment that does not you will need to include a
polyfill.

## Usage

Much like the `Promise` API the constructor for the `Confirmer` takes
a function. That function is passed a resolver object which has four functions
on it that you can use to *fulfill* the `Confirmer`.

```js
new Confirmer(function (resolver) {
  // Affirm confirmation
  resolver.confirm();
  // Reject confirmation
  resolver.reject();
  // Cancel confirmation
  resolver.cancel();
  // Reject with an Error
  resolver.error(new Error());
  // Register a disposer function to clean up resources
  // Same as onDone but in the initializer function closure
  resolver.dispose(function () { … });
})
```

Each state can take an optional value. The `Confirmer` is a wrapper around
a `Promise` and can be treated as a promise. For example to capture any errors
or exceptions you may trigger you would use the `catch()` function.

```js
new Confirmer(function (resolver) { … })
  .catch(function (reason) { console.error(reason); });
```

The `then()` function will be passed the underlying data object:

```js
new Confirmer(function (resolver) { … })
  .then(function (result) {
    console.log(result.reason);
    console.log(result.value);
  });
```

The `reason` being one of `rejected`, `confirmed`, or `cancelled`. And the
`value` is the value passed to one of the resolver functions.

## API

<a name="Confirmer"></a>

### Confirmer
The main class is referred to as `Confirmer` though the packaging is called
`confirmed` This is simply to prevent an NPM name collision but the proper
term for this utility is `Confirmer` and is referenced as such in this
documentation.

**Kind**: global class  

* [Confirmer](#Confirmer)
    * [new Confirmer(initFn)](#new_Confirmer_new)
    * _instance_
        * [.onConfirmed(fn)](#Confirmer+onConfirmed) ⇒ [<code>Confirmer</code>](#Confirmer)
        * [.onRejected(fn)](#Confirmer+onRejected) ⇒ [<code>Confirmer</code>](#Confirmer)
        * [.onCancelled(fn)](#Confirmer+onCancelled) ⇒ [<code>Confirmer</code>](#Confirmer)
        * ~~[.onCanceled()](#Confirmer+onCanceled)~~
        * [.onDone(fn)](#Confirmer+onDone) ⇒ [<code>Confirmer</code>](#Confirmer)
        * [.then(onFulfilled, onRejected)](#Confirmer+then) ⇒ <code>Promise</code>
        * [.catch(onRejected)](#Confirmer+catch) ⇒ <code>Promise</code>
    * _static_
        * [.resolve(result)](#Confirmer.resolve) ⇒ [<code>Confirmer</code>](#Confirmer)


* * *

<a name="new_Confirmer_new"></a>

#### new Confirmer(initFn)
Much like the `Promise` API the constructor for the `Confirmer` takes a
function. That function is passed a resolver object which has three
functions on it that you can use to *fulfill* the `Confirmer`, one
function to register an error, and a disposer function to clean up
resources is needed. Each fulfillment function can take an optional value.

#### Example
```js
new Confirmer(function (resolver) {
  // Affirm confirmation
  resolver.confirm();
  // Reject confirmation
  resolver.reject();
  // Cancel confirmation
  resolver.cancel();
  // Reject with an Error
  resolver.error(new Error());
  // Register a disposer function to clean up resources
  // Same as onDone but in the initializer function closure
  resolver.dispose(function () { … });
});
```

**Params**

- initFn <code>function</code> - The initializer function


* * *

<a name="Confirmer+onConfirmed"></a>

#### confirmer.onConfirmed(fn) ⇒ [<code>Confirmer</code>](#Confirmer)
Register callback that is called when `resolver.confirm()` is triggered.
Used to denote that the user has confirmed in some way. ("OK" button,
correct login credentials, etc.)

If the callback returns a new Confirmer the result will be that new
Confirmer allowing the callback to change the fulfillment reason as part
of the chaining. If it is simply a scalar value the fulfillment reason
with remain the same but the value will change.

**Kind**: instance method of [<code>Confirmer</code>](#Confirmer)  
**Returns**: [<code>Confirmer</code>](#Confirmer) - A new Confirmer instance for chaining  
**Params**

- fn <code>function</code> - callback function called when Confirmer is confirmed


* * *

<a name="Confirmer+onRejected"></a>

#### confirmer.onRejected(fn) ⇒ [<code>Confirmer</code>](#Confirmer)
Register callback that is called when `resolver.rejected()` is triggered.
Used to denote that the user has performed an action that denied the
confirmation. ("No" button, bad password, etc.)

If the callback returns a new Confirmer the result will be that new
Confirmer allowing the callback to change the fulfillment reason as part
of the chaining. If it is simply a scalar value the fulfillment reason
with remain the same but the value will change.

**Kind**: instance method of [<code>Confirmer</code>](#Confirmer)  
**Returns**: [<code>Confirmer</code>](#Confirmer) - A new Confirmer instance for chaining  
**Params**

- fn <code>function</code> - callback function called when Confirmer is rejected


* * *

<a name="Confirmer+onCancelled"></a>

#### confirmer.onCancelled(fn) ⇒ [<code>Confirmer</code>](#Confirmer)
Register callback that is called when `resolver.cancel()` is triggered.
Used to denote that the confirmation was cancelled and perhaps should do
nothing.

If the callback returns a new Confirmer the result will be that new
Confirmer allowing the callback to change the fulfillment reason as part
of the chaining. If it is simply a scalar value the fulfillment reason
with remain the same but the value will change.

**Kind**: instance method of [<code>Confirmer</code>](#Confirmer)  
**Returns**: [<code>Confirmer</code>](#Confirmer) - A new Confirmer instance for chaining  
**Params**

- fn <code>function</code> - callback function called when Confirmer is cancelled


* * *

<a name="Confirmer+onCanceled"></a>

#### ~~confirmer.onCanceled()~~
***Deprecated***

Spelling error; use `onCancelled`.

**Kind**: instance method of [<code>Confirmer</code>](#Confirmer)  

* * *

<a name="Confirmer+onDone"></a>

#### confirmer.onDone(fn) ⇒ [<code>Confirmer</code>](#Confirmer)
Register a callback that is called when any of the resolver functions are
triggered. This is used for clean up like closing the dialog and removing
stale event handlers. This is also called if the `resolver.error()` is
triggered or something throws an exception in the initialization function
(which can be captured by the `catch()` function just like a promise).

**Kind**: instance method of [<code>Confirmer</code>](#Confirmer)  
**Returns**: [<code>Confirmer</code>](#Confirmer) - A new Confirmer instance for chaining  
**Params**

- fn <code>function</code> - callback function called when Confirmer is resolved/errored


* * *

<a name="Confirmer+then"></a>

#### confirmer.then(onFulfilled, onRejected) ⇒ <code>Promise</code>
Cast to a `Promise`. Will proxy to the internal promise `then()` method.
Since the result is a Promise it will not chain as Confirmer after this.

The result of a fulfilled promise is an Object with `reason` and `value`
properties. See [resolve](#Confirmer.resolve) for more details of this
internal object.

**Kind**: instance method of [<code>Confirmer</code>](#Confirmer)  
**Params**

- onFulfilled <code>function</code> - callback when internal promise is fulfilled
- onRejected <code>function</code> - callback when internal promise is rejected


* * *

<a name="Confirmer+catch"></a>

#### confirmer.catch(onRejected) ⇒ <code>Promise</code>
Cast to a `Promise`. Will proxy to the internal promise `catch()` method.
Since the result is a Promise it will not chain as Confirmer after this.

**Kind**: instance method of [<code>Confirmer</code>](#Confirmer)  
**Params**

- onRejected <code>function</code> - callback when internal promise is rejected


* * *

<a name="Confirmer.resolve"></a>

#### Confirmer.resolve(result) ⇒ [<code>Confirmer</code>](#Confirmer)
Low level utility to construct a new `Confirmer` with a fulfillment. It is
designed to easily wrap the internal promise/resolution in a `Confirmer`
object.

* if a `Confirmer` is passed it will be returned
* if a `Promise` is passed it will become the internal promise of a new Confirmer
* if an `Object` is passed it will become the fulfilled value of the internal promise of a new Confirmer

**Warning:** Any other type will cause the Confirmer to reject with an
error.

The internal fulfillment value (either directly of as the result of a
promise resolution) must be an Object with these properties:

* reason `String` - the reason for the fulfillment. One of "confirmed", "cancelled", or "rejected".
* value `Any` - the value associated (optional)

**Kind**: static method of [<code>Confirmer</code>](#Confirmer)  
**Returns**: [<code>Confirmer</code>](#Confirmer) - a new Confirmer that has/will be resolved to the result  
**Params**

- result [<code>Confirmer</code>](#Confirmer) | <code>Promise</code> | <code>Object</code> - the result the new Confirmer should resolve to


* * *


## Examples

The following are example situations that I've run into and how this module can
help reason about them.

### Basic `window.confirm`

In this example we will wrap the `window.confirm`. Although this is **not**
asynchronous it does illustrate the API.

```js
new Confirmer(function (resolver) {
  if (confirm('Whould you like to do this?')) {
    resolver.confirm();
  } else {
    resolver.cancel();
  }
})
  .onConfirmed(function () { console.log('Ok! let\'s crack on!'); })
  .onCancelled(function () { console.log('Maybe next time then?'); })
  .onDone(function () { console.log('Confirm completed') });
```

### jQuery dialog

Here we show how to toggle a modal dialog with jQuery.

```js
new Confirmer(function (resolver) {
  $('#modal-dialog button.yes').one('click', resolver.confirm);
  $('#modal-dialog button.no').one('click', resolver.cancel);
  $('#modal-dialog').show();
})
  .onConfirmed(function () { console.log('Ok! let\'s crack on!'); })
  .onCancelled(function () { console.log('Maybe next time then?'); })
  .onDone(function () {
    $('#modal-dialog button').off('click');
    $('#modal-dialog').hide();
  });
```

### Password prompt

Maybe the resolution of the confirmation needs more logic. For example asking
for a password.

```js
new Confirmer(function (resolver) {
  function checkPassword() {
    var passwd = $('#password-dialog input.passord').val();
    if (passwd === 'password') {
      resolver.confirm(123);
    } else {
      resolver.reject('incorrect password');
    }
  }
  $('#password-dialog button.ok').one('click', checkPassword);
  $('#password-dialog button.cancel').one('click', resolver.cancel);
  $('#password-dialog').show();
})
  .onConfirmed(function (userID) {
    console.log('User ' + userID + ', you may proceed.');
  })
  .onRejected(function (message) {
    console.log('Access denied: ' + message);
  })
  .onDone(function () {
    $('#password-dialog input.passord').val('');
    $('#modal-dialog button').off('click');
    $('#password-dialog').hide();
  });
```

## Auto closing message box

Here is an example of a message box that auto closes after 5 seconds.

Notice that you can call the resolver functions multiple times and only the
first one wins.

```js
new Confirmer(function (resolver) {
  setTimeout(resolver.cancel, 5000);
  $('#modal-dialog button.ok').one('click', resolver.confirm);
  $('#modal-dialog').show();
}).onDone(function () {
  $('#modal-dialog button').off('click');
  $('#modal-dialog').hide();
});
```

## Vanilla DOM Events (using the dispose function)

Because vanilla DOM events are a common area for memory leaks the expectation
is that when you `addEventListener` you have a corresponding
`removeEventListener`. Unfortunately this requires a reference to the event
handler function. This is typically accomplished using named functions.
However, that also adds scope problems and more boilerplate. Some attempt to
use `arguments.callee`, some use `var _this = this`, and some use outer scoped
variables. This example takes advantage of the `dispose` API to make disposing
resources in a cleaner (read prettier) way.

```js
let dialog = document.getElementById('modal-dialog');
let buttonYes = dialog.querySelector('button.yes');
let buttonNo = dialog.querySelector('button.no');

new Confirmer(function (resolver) {
  buttonYes.addEventListener('click', resolver.confirm);
  buttonNo.addEventListener('click', resolver.cancel);
  resolver.dispose(function () {
    buttonYes.removeEventListener('click', resolver.confirm);
    buttonNo.removeEventListener('click', resolver.cancel);
  });
  dialog.style.display = 'block';
})
  .onConfirmed(function () { console.log('Ok! let\'s crack on!'); })
  .onCancelled(function () { console.log('Maybe next time then?'); })
  .onDone(function () { dialog.style.display = 'none'; });
```
