const sinon = require('sinon');
const Confirmer = require('../dist/confirmer').default;

describe('Confirmer', function () {
  beforeEach(function () {
    this.onCancelledSpy = sinon.spy();
    this.onConfirmedSpy = sinon.spy();
    this.onRejectedSpy = sinon.spy();
    this.onDoneSpy = sinon.spy();
  });

  describe('when confirmation is cancelled', function () {
    it('calls appropriate callbacks', async function () {
      await new Confirmer(resolver => resolver.cancel('test-payload'))
        .onCancelled(this.onCancelledSpy)
        .onConfirmed(this.onConfirmedSpy)
        .onRejected(this.onRejectedSpy)
        .onDone(this.onDoneSpy);
      sinon.assert.calledWith(this.onCancelledSpy, 'test-payload');
      sinon.assert.notCalled(this.onConfirmedSpy);
      sinon.assert.notCalled(this.onRejectedSpy);
      sinon.assert.called(this.onDoneSpy);
    });
  });

  describe('when confirmation is confirmed', function () {
    it('calls appropriate callbacks', async function () {
      await new Confirmer(resolver => resolver.confirm('test-payload'))
        .onCancelled(this.onCancelledSpy)
        .onConfirmed(this.onConfirmedSpy)
        .onRejected(this.onRejectedSpy)
        .onDone(this.onDoneSpy);
      sinon.assert.notCalled(this.onCancelledSpy);
      sinon.assert.calledWith(this.onConfirmedSpy, 'test-payload');
      sinon.assert.notCalled(this.onRejectedSpy);
      sinon.assert.called(this.onDoneSpy);
    });
  });

  describe('when confirmation is rejected', function () {
    it('calls appropriate callbacks', async function () {
      await new Confirmer(resolver => resolver.reject('test-payload'))
        .onCancelled(this.onCancelledSpy)
        .onConfirmed(this.onConfirmedSpy)
        .onRejected(this.onRejectedSpy)
        .onDone(this.onDoneSpy);
      sinon.assert.notCalled(this.onCancelledSpy);
      sinon.assert.notCalled(this.onConfirmedSpy);
      sinon.assert.calledWith(this.onRejectedSpy, 'test-payload');
      sinon.assert.called(this.onDoneSpy);
    });
  });
});
