import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import logger from '../../lib/logger';
import { RoleName } from '../../entities/role';
import { Router, Request, Response } from 'express';
import { handleError, handleMaybe, handleOK } from '../../lib/httpUtil';
import { pipe } from 'fp-ts/lib/function';
import { roleRepository } from '../../repositories/roleRepository';
import { toValidationError } from '../../lib/fpUtil';

const roleRouter = Router();

roleRouter.get('/', findAllRoles);
roleRouter.get('/:roleName', findRoleByRoleName);

function findAllRoles(req: Request, res: Response): Promise<void> {
  logger.info(`Attempting to get all roles`);
  return pipe(
    roleRepository.findAllRoles(),
    TE.map(roles => ({ roles })),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function findRoleByRoleName(req: Request, res: Response): Promise<void> {
  const { roleName } = req.params;
  logger.info(`Attempting to get role by role name: '${roleName}'`);
  return pipe(
    RoleName.decode(roleName),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(roleRepository.findRoleByRoleName),
    TE.fold(handleError(res), handleMaybe(res)),
    invoke => invoke()
  )
}

export default roleRouter;
