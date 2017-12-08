const sinon = require('sinon');
const Confirmer = require('../dist/confirmer').default;

describe('Confirmer', function () {
  beforeEach(function () {
    this.onCancelledStub = sinon.stub().returnsArg(0);
    this.onConfirmedStub = sinon.stub().returnsArg(0);
    this.onRejectedStub = sinon.stub().returnsArg(0);
    this.onDoneStub = sinon.stub().returnsArg(0);
  });

  describe('when confirmation is cancelled', function () {
    it('calls appropriate callbacks', async function () {
      await new Confirmer(resolver => resolver.cancel('test-payload'))
        .onCancelled(this.onCancelledStub)
        .onConfirmed(this.onConfirmedStub)
        .onRejected(this.onRejectedStub)
        .onDone(this.onDoneStub);
      sinon.assert.calledWith(this.onCancelledStub, 'test-payload');
      sinon.assert.notCalled(this.onConfirmedStub);
      sinon.assert.notCalled(this.onRejectedStub);
      sinon.assert.called(this.onDoneStub);
    });

    describe('#onCancelled', function () {
      it('is chainable', async function () {
        await new Confirmer(resolver => resolver.cancel('test-payload'))
          .onCancelled(this.onCancelledStub)
          .onCancelled(this.onCancelledStub);
        sinon.assert.calledTwice(this.onCancelledStub);
        sinon.assert.alwaysCalledWith(this.onCancelledStub, 'test-payload');
      });

      it('mutates the value', async function () {
        let onCancelledMutateStub = sinon.stub().returns('mutated-payload');
        await new Confirmer(resolver => resolver.cancel('test-payload'))
          .onCancelled(onCancelledMutateStub)
          .onCancelled(this.onCancelledStub);
        sinon.assert.calledWith(onCancelledMutateStub, 'test-payload');
        sinon.assert.calledWith(this.onCancelledStub, 'mutated-payload');
      });
    });
  });

  describe('when confirmation is confirmed', function () {
    it('calls appropriate callbacks', async function () {
      await new Confirmer(resolver => resolver.confirm('test-payload'))
        .onCancelled(this.onCancelledStub)
        .onConfirmed(this.onConfirmedStub)
        .onRejected(this.onRejectedStub)
        .onDone(this.onDoneStub);
      sinon.assert.notCalled(this.onCancelledStub);
      sinon.assert.calledWith(this.onConfirmedStub, 'test-payload');
      sinon.assert.notCalled(this.onRejectedStub);
      sinon.assert.called(this.onDoneStub);
    });

    describe('#onConfirmed', function () {
      it('is chainable', async function () {
        await new Confirmer(resolver => resolver.confirm('test-payload'))
          .onConfirmed(this.onConfirmedStub)
          .onConfirmed(this.onConfirmedStub);
        sinon.assert.calledTwice(this.onConfirmedStub);
        sinon.assert.alwaysCalledWith(this.onConfirmedStub, 'test-payload');
      });

      it('mutates the value', async function () {
        let onConfirmedMutateStub = sinon.stub().returns('mutated-payload');
        await new Confirmer(resolver => resolver.confirm('test-payload'))
          .onConfirmed(onConfirmedMutateStub)
          .onConfirmed(this.onConfirmedStub);
        sinon.assert.calledWith(onConfirmedMutateStub, 'test-payload');
        sinon.assert.calledWith(this.onConfirmedStub, 'mutated-payload');
      });
    });
  });

  describe('when confirmation is rejected', function () {
    it('calls appropriate callbacks', async function () {
      await new Confirmer(resolver => resolver.reject('test-payload'))
        .onCancelled(this.onCancelledStub)
        .onConfirmed(this.onConfirmedStub)
        .onRejected(this.onRejectedStub)
        .onDone(this.onDoneStub);
      sinon.assert.notCalled(this.onCancelledStub);
      sinon.assert.notCalled(this.onConfirmedStub);
      sinon.assert.calledWith(this.onRejectedStub, 'test-payload');
      sinon.assert.called(this.onDoneStub);
    });

    describe('#onRejected', function () {
      it('is chainable', async function () {
        await new Confirmer(resolver => resolver.reject('test-payload'))
          .onRejected(this.onRejectedStub)
          .onRejected(this.onRejectedStub);
        sinon.assert.calledTwice(this.onRejectedStub);
        sinon.assert.alwaysCalledWith(this.onRejectedStub, 'test-payload');
      });

      it('mutates the value', async function () {
        let onRejectedMutateStub = sinon.stub().returns('mutated-payload');
        await new Confirmer(resolver => resolver.reject('test-payload'))
          .onRejected(onRejectedMutateStub)
          .onRejected(this.onRejectedStub);
        sinon.assert.calledWith(onRejectedMutateStub, 'test-payload');
        sinon.assert.calledWith(this.onRejectedStub, 'mutated-payload');
      });
    });
  });
});
