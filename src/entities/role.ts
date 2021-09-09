import * as t from 'io-ts';
import { NumericId, Timestamp } from '../types/types';
import { withMessage } from 'io-ts-types';

export const RoleId = withMessage(
  NumericId,
  input => `Unable to parse role id from: ${input}`
)
export type RoleId = t.TypeOf<typeof RoleId>;

export const RoleName = withMessage(
  t.keyof({
    user: null,
    admin: null
  }, 'RoleName'),
  () => 'Invalid role name'
);
export type RoleName = t.TypeOf<typeof RoleName>;

export const Role = t.type({
  roleId: RoleId,
  roleName: RoleName,
  roleDescription: t.string,
  createdAt: Timestamp
}, 'Role');
export type Role = t.TypeOf<typeof Role>;
