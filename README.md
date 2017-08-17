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

The following methods are chainable:

#### `onCanceled`

Is called when `resolver.cancel()` is triggered. Used to denote that the
confirmation was cancelled and perhaps should do nothing.

#### `onConfirmed`

Is called when `resolver.confirm()` is triggered. Used to denote that the user
has confirmed in some way. ("OK" button, correct login credentials, etc.)

#### `onRejected`

Is called when `resolver.rejected()` is triggered. Used to denote that the user
has performed an action that denied the confirmation. ("No" button, bad
password, etc.)

#### `onDone`

Is called when **any** of the resolver functions are triggered. This is used for
clean up like closing the dialog and removing stale event handlers. This is also
called if the `resolver.error` is triggered or something throws an exception in
the initialization function (which can be captued by the `catch()` function just
like a promise).

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
