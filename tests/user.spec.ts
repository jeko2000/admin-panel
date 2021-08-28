import assert from 'assert';
import * as E from 'fp-ts/Either';
import { User } from '../src/entities/user';

describe('Test User smart constructor', () => {
  it(`valid user props should return value`, () => {
    assert(
      E.isRight(User.of(
        'cbded199-32a2-49e0-96f9-649a25d85d8a',
        'test@mail.com',
        '$2b$10$uc5mQpKEElAdy/TxGqXk3.aTNpn.pY.Vg6TqCVilJL3Y/f9FAjMz6',
        new Date("2021-01-01")
      ))
    )
  })
})
