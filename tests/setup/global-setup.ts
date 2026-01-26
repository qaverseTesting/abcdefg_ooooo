import fs from 'fs';
import path from 'path';
import { ENV, CURRENT_ENVIRONMENT } from '../../src/config/env';

export default async () => {
  const resultsDir = path.resolve('allure-results');
   console.log('▶ Base URL project:', ENV.BASE_URL);

  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const content = `
ENVIRONMENT=${CURRENT_ENVIRONMENT}
BASE_URL=${ENV.BASE_URL}
CI=${process.env.CI ?? 'false'}
`.trim();

  fs.writeFileSync(
    path.join(resultsDir, 'environment.properties'),
    content
  );
};