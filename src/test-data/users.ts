import { ENV } from '../config/env';
import { UserRole } from '../constants/roles';

export const users = {
  [UserRole.GROUP_HOST]: ENV.USERS.GROUPHOST,
  [UserRole.USER]: ENV.USERS.USER
};
