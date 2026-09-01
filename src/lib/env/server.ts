import "server-only";

import { parseEnvironment } from "./schema";

export const environment = parseEnvironment(process.env);
