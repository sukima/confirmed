const sinon = require('sinon');
const { default: Confirmer, CONFIRMED } = require('../dist/confirmer');

const TEST_ERROR = sinon.match.instanceOf(Error)
  .and(sinon.match.has('message', 'Test Error'));

describe('Confirmer', function () {
  beforeEach(function () {
    this.onCancelledStub = sinon.stub().returnsArg(0);
    this.onConfirmedStub = sinon.stub().returnsArg(0);
    this.onRejectedStub = sinon.stub().returnsArg(0);
    this.onDoneStub = sinon.stub();
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

      it('mutates the value ehwn a promise is returned', async function () {
        let onCancelledMutateStub = sinon.stub()
          .returns(Promise.resolve('mutated-payload'));
        await new Confirmer(resolver => resolver.cancel('test-payload'))
          .onCancelled(onCancelledMutateStub)
          .onCancelled(this.onCancelledStub);
        sinon.assert.calledWith(onCancelledMutateStub, 'test-payload');
        sinon.assert.calledWith(this.onCancelledStub, 'mutated-payload');
      });

      it('mutates the reason when a new Confirmer is returned', async function () {
        let mutatedConfirmer = new Confirmer(({confirm}) => confirm('mutated-payload'));
        let onCancelledMutateStub = sinon.stub().returns(mutatedConfirmer);
        await new Confirmer(resolver => resolver.cancel('test-payload'))
          .onCancelled(onCancelledMutateStub)
          .onConfirmed(this.onConfirmedStub);
        sinon.assert.calledWith(onCancelledMutateStub, 'test-payload');
        sinon.assert.calledWith(this.onConfirmedStub, 'mutated-payload');
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

      it('mutates the value when a promise is returned', async function () {
        let onConfirmedMutateStub = sinon.stub()
          .returns(Promise.resolve('mutated-payload'));
        await new Confirmer(resolver => resolver.confirm('test-payload'))
          .onConfirmed(onConfirmedMutateStub)
          .onConfirmed(this.onConfirmedStub);
        sinon.assert.calledWith(onConfirmedMutateStub, 'test-payload');
        sinon.assert.calledWith(this.onConfirmedStub, 'mutated-payload');
      });

      it('mutates the reason when a new Confirmer is returned', async function () {
        let mutatedConfirmer = new Confirmer(({cancel}) => cancel('mutated-payload'));
        let onConfirmedMutateStub = sinon.stub().returns(mutatedConfirmer);
        await new Confirmer(resolver => resolver.confirm('test-payload'))
          .onConfirmed(onConfirmedMutateStub)
          .onCancelled(this.onCancelledStub);
        sinon.assert.calledWith(onConfirmedMutateStub, 'test-payload');
        sinon.assert.calledWith(this.onCancelledStub, 'mutated-payload');
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

      it('mutates the value when a promise is returned', async function () {
        let onRejectedMutateStub = sinon.stub()
          .returns(Promise.resolve('mutated-payload'));
        await new Confirmer(resolver => resolver.reject('test-payload'))
          .onRejected(onRejectedMutateStub)
          .onRejected(this.onRejectedStub);
        sinon.assert.calledWith(onRejectedMutateStub, 'test-payload');
        sinon.assert.calledWith(this.onRejectedStub, 'mutated-payload');
      });

      it('mutates the reason when a new Confirmer is returned', async function () {
        let mutatedConfirmer = new Confirmer(({confirm}) => confirm('mutated-payload'));
        let onRejectedMutateStub = sinon.stub().returns(mutatedConfirmer);
        await new Confirmer(resolver => resolver.reject('test-payload'))
          .onRejected(onRejectedMutateStub)
          .onConfirmed(this.onConfirmedStub);
        sinon.assert.calledWith(onRejectedMutateStub, 'test-payload');
        sinon.assert.calledWith(this.onConfirmedStub, 'mutated-payload');
      });
    });
  });

  describe('using the dispose function', function () {
    describe('when confirmer resolves', function () {
      it('facilitates disposing of resources', async function () {
        let disposerStub = sinon.stub().resolves('barfoo');
        let result = await new Confirmer(resolver => {
          resolver.dispose(disposerStub);
          resolver.confirm('foobar');
        });
        sinon.assert.match(result, sinon.match.has('value', 'foobar'));
        sinon.assert.called(disposerStub);
      });
    });

    describe('when confirmer rejects', function () {
      it('facilitates disposing of resources', async function () {
        let failedSpy = sinon.spy();
        let disposerStub = sinon.stub().resolves('barfoo');
        await new Confirmer(resolver => {
          resolver.dispose(disposerStub);
          resolver.error(new Error('Test Error'));
        }).catch(failedSpy);
        sinon.assert.called(disposerStub);
        sinon.assert.calledWith(failedSpy, TEST_ERROR);
      });
    });
  });

  describe('#resolve', function () {
    it('returns the same Confirmer when given a Confirmer', function () {
      let subject = new Confirmer(() => {});
      let result = Confirmer.resolve(subject);
      sinon.assert.match(result, subject);
    });

    it('returns a new Confirmer when passed a promise', function () {
      let subject = Confirmer.resolve(Promise.resolve({reason: CONFIRMED, value: 'foo'}));
      sinon.assert.match(subject, sinon.match.instanceOf(Confirmer));
    });

    it('returns a new Confirmer when passed an internal payload', async function () {
      let subject = Confirmer.resolve({reason: CONFIRMED, value: 'foo'});
      let result = await subject;
      sinon.assert.match(subject, sinon.match.instanceOf(Confirmer));
      sinon.assert.match(result, {reason: CONFIRMED, value: 'foo'});
    });

    it('rejects when passed scalar values', async function () {
      try {
        await Confirmer.resolve('bogus');
        sinon.assert.fail('expected Confirmer to be rejected');
      } catch (error) {
        sinon.assert.pass();
      }
    });

    it('rejects when passed an internal payload with a unknown reason', async function () {
      try {
        await Confirmer.resolve({reason: 'unknown-reason', value: 'foo'});
        sinon.assert.fail('expected Confirmer to be rejected');
      } catch (error) {
        sinon.assert.pass();
      }
    });
  });
});
