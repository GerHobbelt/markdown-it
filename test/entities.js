
import assert from 'assert';
import entities from '../lib/common/entities.js';


describe('HTML Entities (sampling tests)', function () {
  it('should include &amp;', function () {
    assert.strictEqual(entities.amp, '&');
  });

  it('should include &xcirc;', function () {
    assert.strictEqual(entities.xcirc, '◯');
  });
});
