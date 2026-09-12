import { z } from 'zod';
import pino from 'pino';
const logger = pino();
export class BuilderCore {
  generate(spec: any) {
    logger.info('Generating scaffold for: ' + spec.name);
    return { status: 'success', files: [] };
  }
}