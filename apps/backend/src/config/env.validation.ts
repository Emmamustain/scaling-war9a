type EnvMap = Record<string, unknown>;

function getString(config: EnvMap, key: string): string | undefined {
  const value = config[key];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateEnvironment(config: EnvMap): EnvMap {
  const errors: string[] = [];
  const isProduction = getString(config, 'NODE_ENV') === 'production';

  const databaseUrl = getString(config, 'DATABASE_URL');
  if (!databaseUrl) {
    errors.push('DATABASE_URL must be configured');
  } else if (!/^(postgres|postgresql):\/\//i.test(databaseUrl)) {
    errors.push('DATABASE_URL must be a postgres/postgresql connection string');
  }

  const betterAuthSecret = getString(config, 'BETTER_AUTH_SECRET');
  if (!betterAuthSecret) {
    errors.push('BETTER_AUTH_SECRET must be configured');
  } else if (betterAuthSecret.length < 32) {
    errors.push('BETTER_AUTH_SECRET must be at least 32 characters');
  }

  if (isProduction) {
    const betterAuthUrl = getString(config, 'BETTER_AUTH_URL');
    if (!betterAuthUrl) {
      errors.push('BETTER_AUTH_URL must be configured in production');
    } else if (!isHttpUrl(betterAuthUrl)) {
      errors.push('BETTER_AUTH_URL must be an absolute https URL');
    }

    const frontendUrl = getString(config, 'FRONTEND_URL');
    if (!frontendUrl) {
      errors.push('FRONTEND_URL must be configured in production');
    } else if (!isHttpUrl(frontendUrl)) {
      errors.push('FRONTEND_URL must be an absolute https URL');
    }

    const minioAccessKey = getString(config, 'MINIO_ACCESS_KEY');
    if (!minioAccessKey) {
      errors.push('MINIO_ACCESS_KEY must be configured in production');
    }
    const minioSecretKey = getString(config, 'MINIO_SECRET_KEY');
    if (!minioSecretKey) {
      errors.push('MINIO_SECRET_KEY must be configured in production');
    }
  }

  const cookieSameSite = getString(config, 'COOKIE_SAME_SITE')?.toLowerCase();
  if (
    cookieSameSite &&
    cookieSameSite !== 'lax' &&
    cookieSameSite !== 'strict' &&
    cookieSameSite !== 'none'
  ) {
    errors.push('COOKIE_SAME_SITE must be one of: lax, strict, none');
  }

  const sessionCookieSecure = getString(config, 'SESSION_COOKIE_SECURE');
  if (
    sessionCookieSecure &&
    sessionCookieSecure !== 'true' &&
    sessionCookieSecure !== 'false'
  ) {
    errors.push('SESSION_COOKIE_SECURE must be "true" or "false"');
  }

  if (cookieSameSite === 'none' && sessionCookieSecure !== 'true') {
    errors.push('COOKIE_SAME_SITE=none requires SESSION_COOKIE_SECURE=true');
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }

  return config;
}
