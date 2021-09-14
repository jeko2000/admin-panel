import logger from '../../clients/logger';
import { RoleName } from '../../entities/role';
import { Router, Request, Response } from 'express';
import { chain, fold, map } from 'fp-ts/TaskEither'
import { decodeTypeT } from '../../util/fpUtil';
import { handleError, handleMaybe, handleOK } from '../../util/httpUtil';
import { pipe } from 'fp-ts/function';
import { roleRepository } from '../../repositories/roleRepository';

const roleRouter = Router();

roleRouter.get('/', findAllRoles);
roleRouter.get('/:roleName', findRoleByRoleName);

function findAllRoles(_req: Request, res: Response): Promise<void> {
  logger.info(`Attempting to get all roles`);
  return pipe(
    roleRepository.findAllRoles(),
    map(roles => ({ roles })),
    fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function findRoleByRoleName(req: Request, res: Response): Promise<void> {
  const { roleName } = req.params;
  logger.info(`Attempting to get role by role name: '${roleName}'`);
  return pipe(
    decodeTypeT(RoleName, roleName),
    chain(roleRepository.findRoleByRoleName),
    fold(handleError(res), handleMaybe(res)),
    invoke => invoke()
  )
}

export default roleRouter;
