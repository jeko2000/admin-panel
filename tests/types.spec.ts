import assert from 'assert';
import * as E from 'fp-ts/Either';
import {
  makeEmailAddress,
  makeNonEmptyString,
  makeNonEmptyString50,
  makePassword,
  makePasswordHash,
  makeUuid
} from '../src/types/types';

describe('Test types and constructors', () => {
  describe('#makeNonEmptyString()', () => {
    it(`empty strings should return left`, () => {
      assert(E.isLeft(makeNonEmptyString('')))
    });

    it(`non-empty strings should return value`, () => {
      assert.deepStrictEqual(makeNonEmptyString('sample'), E.right('sample'))
    })
  })

  describe('#makeNonEmptyString50()', function() {
    it(`empty strings should return left`, () => {
      assert(E.isLeft(makeNonEmptyString50('')))
    });

    it(`strings longer than 50 chars should return left`, () => {
      assert(E.isLeft(makeNonEmptyString50('*'.repeat(51))))
    })

    it(`short non-empty strings should return value`, () => {
      assert.deepStrictEqual(makeNonEmptyString50('test'), E.right('test'))
    })
  })

  describe('#makeUuid()', function() {
    it(`empty strings should return left`, () => {
      assert(E.isLeft(makeUuid('')))
    });

    it(`non-UUID strings should return left`, () => {
      assert(E.isLeft(makeUuid('not-a-uuid')))
    })

    it(`uuid strings should return value`, () => {
      assert.deepStrictEqual(
        makeUuid('123e4567-e89b-12d3-a456-426614174000'),
        E.right('123e4567-e89b-12d3-a456-426614174000'))
    })
  })

  describe('#makeEmailAddress()', function() {
    it(`empty strings should return left`, () => {
      assert(E.isLeft(makeEmailAddress('')))
    });

    it(`non-email address strings should return left`, () => {
      assert(E.isLeft(makeEmailAddress('not@me')))
    })

    it(`email address strings should return value`, () => {
      assert.deepStrictEqual(
        makeEmailAddress('test@mail.com'),
        E.right('test@mail.com'))
    })
  })

  describe('#makePassword()', function() {
    it(`empty strings should return left`, () => {
      assert(E.isLeft(makePassword('')))
    });

    it(`short strings should return left`, () => {
      assert(E.isLeft(makePassword('short')))
    })

    it(`long strings should return left`, () => {
      assert(E.isLeft(makePassword('t'.repeat(70))))
    })

    it(`mid-sized strings should return value`, () => {
      assert.deepStrictEqual(
        makePassword('equinox-given-recoup-antique'),
        E.right('equinox-given-recoup-antique'))
    })
  })

  describe('#makePasswordHash()', function() {
    it(`empty strings should return left`, () => {
      assert(E.isLeft(makePasswordHash('')))
    });

    it(`short strings should return left`, () => {
      assert(E.isLeft(makePasswordHash('short')))
    })

    it(`long strings should return left`, () => {
      assert(E.isLeft(makePasswordHash('t'.repeat(70))))
    })

    it(`bcrypt hash strings should return value`, () => {
      assert.deepStrictEqual(
        makePasswordHash('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
        E.right('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'))
    })
  })
})
