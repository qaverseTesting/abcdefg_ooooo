import * as dotenv from 'dotenv';
dotenv.config();

type EnvironmentType = 'staging' | 'live';

const CURRENT_ENV = (process.env.ENVIRONMENT as EnvironmentType) || 'live';

const ENV_CONFIG = {
  staging: {
    BASE_URL: process.env.STAGING_BASE_URL!,
    USERS: {
      GROUPHOST: {
        username: process.env.STAGING_GROUPHOST_USERNAME!,
        password: process.env.STAGING_GROUPHOST_PASSWORD!
      },
      USER: {
        username: process.env.STAGING_USER_USERNAME!,
        password: process.env.STAGING_USER_PASSWORD!
      }
    }
  },

  live: {
    BASE_URL: process.env.LIVE_BASE_URL!,
    USERS: {
      GROUPHOST: {
        username: process.env.LIVE_GROUPHOST_USERNAME!,
        password: process.env.LIVE_GROUPHOST_PASSWORD!
      },
      USER: {
        username: process.env.LIVE_USER_USERNAME!,
        password: process.env.LIVE_USER_PASSWORD!
      }
    }
  }
};

export const ENV = ENV_CONFIG[CURRENT_ENV];
