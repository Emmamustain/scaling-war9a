export type AuthMode = 'hybrid' | 'github_only';

export type AuthCapabilities = {
  emailPassword: boolean;
  google: boolean;
  github: boolean;
};

export const ACCOUNT_LINKING_POLICY = {
  enabled: true,
  allowDifferentEmails: false,
};

export function normalizeAuthMode(
  value: string | undefined,
): AuthMode | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'hybrid' || normalized === 'github_only') {
    return normalized as AuthMode;
  }
  return undefined;
}

export function hasProviderCredentials(
  clientId: string | undefined,
  clientSecret: string | undefined,
): boolean {
  return (
    typeof clientId === 'string' &&
    clientId.trim().length > 0 &&
    typeof clientSecret === 'string' &&
    clientSecret.trim().length > 0
  );
}

export function isExplicitlyEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true';
}

export function resolveAuthCapabilities(input: {
  mode: AuthMode;
  githubCredentialsPresent: boolean;
  googleCredentialsPresent: boolean;
  googleAuthExplicitlyEnabled: boolean;
}): AuthCapabilities {
  const { mode, githubCredentialsPresent, googleCredentialsPresent, googleAuthExplicitlyEnabled } = input;

  return {
    emailPassword: mode !== 'github_only',
    github: githubCredentialsPresent,
    google:
      mode !== 'github_only' &&
      googleAuthExplicitlyEnabled &&
      googleCredentialsPresent,
  };
}
