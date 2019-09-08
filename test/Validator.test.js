const Validator = require('../src/Validator');
const titleRegex = require('../src/utility')._titleRegex;
const sinon = require('sinon');
const Accuser = require('accuser');

describe('Validator methods', () => {
  let validator;

  beforeEach(() => {
    const stubAccuser = sinon.createStubInstance(Accuser);
    stubAccuser.addRepository = function () { return { newWorker: sinon.stub() }; };
    validator = new Validator(stubAccuser, 'test', 'testRepo');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should validate valid titles', () => {
    const testTitle = Validator.testTitle;
    expect(testTitle('[James Yong] Duke Increments', titleRegex)).toBeTruthy();
    expect(testTitle('[James, Yong] Duke Increments', titleRegex)).toBeTruthy();
    expect(testTitle('[James (Yong)] Duke Increments', titleRegex)).toBeTruthy();
    expect(testTitle('[James/Yong] Duke Increments', titleRegex)).toBeTruthy();
  });

  it('should invalidate invalid titles', () => {
    const testTitle = Validator.testTitle;
    expect(testTitle('[James Yong]Duke Increments', titleRegex)).toBeFalsy();
    expect(testTitle('[James Yong]Duke Increment', titleRegex)).toBeFalsy();
    expect(testTitle('James Yong Duke Increments', titleRegex)).toBeFalsy();
    expect(testTitle('Learning Outcome 1', titleRegex)).toBeFalsy();
    expect(testTitle('W2.2b][W09-1]', titleRegex)).toBeFalsy();
    expect(testTitle('Week 1', titleRegex)).toBeFalsy();
    expect(testTitle('[W2.2ab][W09-1]James Yong', titleRegex)).toBeFalsy();
  });

  it('should show label existence', () => {
    const mockIssue = {
      labels: [{ name: 'A' }, { name: 'B' }]
    };

    expect(Validator.hasLabel(mockIssue, 'A')).toBeTruthy();
  });

  it('should show label non existence', () => {
    const mockIssue = {
      labels: [{ name: 'A' }, { name: 'B' }]
    };

    expect(Validator.hasLabel(mockIssue, 'C')).toBeFalsy();
  });

  it('should ignore case sensitivity for checking label existence', () => {
    const mockIssue = {
      labels: [{ name: 'A' }]
    };

    expect(Validator.hasLabel(mockIssue, 'a')).toBeTruthy();
  });

  it('should not warn if label to apply already found', () => {
    const mockAddUniqueLabel = sinon.stub(validator, 'addUniqueLabel');
    const mockComment = sinon.stub(validator, 'comment');

    const issue = {
      labels: [{ name: 'existing' }]
    };

    validator.warn(issue, 'existing', 'testMu', {}, 'logged');
    expect(mockAddUniqueLabel.notCalled).toBeTruthy();
    expect(mockComment.notCalled).toBeTruthy();
  });

  it('should warn if label to apply not found', () => {
    const mockAddUniqueLabel = sinon.stub(validator, 'addUniqueLabel');
    const mockComment = sinon.stub(validator, 'comment');

    const issue = {
      labels: [{ name: 'existing' }]
    };

    validator.warn(issue, 'new', 'testMu', {}, 'logged');
    expect(mockAddUniqueLabel.calledWithExactly(issue, 'new')).toBeTruthy();
    expect(mockAddUniqueLabel.calledOnce).toBeTruthy();
    expect(mockComment.calledWithExactly(issue, 'testMu', {})).toBeTruthy();
    expect(mockComment.calledOnce).toBeTruthy();
  });
});
