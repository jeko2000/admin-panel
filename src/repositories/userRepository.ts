import * as O from 'fp-ts/Option';
import { User } from '../entities/user';
import { UserId } from "../types/types";

export interface UserRepository {
  findByUserId(userId: UserId): Promise<O.Option<User>>;
}

class MockUserRepository implements UserRepository {
  findByUserId(userId: number): Promise<O.Option<User>> {
    if (userId % 2 == 0) {
      return Promise.resolve(O.none);
    }
    return Promise.resolve(O.fromEither(User.of(
      userId,
      'sample@mail.com',
      'n'.repeat(60)
    )))
  }
}

export const userRepository = new MockUserRepository();
