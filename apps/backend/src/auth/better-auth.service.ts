import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { eq } from '@shared/drizzle/operators';
import { DrizzleDB, schema } from '@shared/drizzle';
import { TReqUser } from '@shared/types';
import { DRIZZLE } from '../drizzle/drizzle.module';
import {
  ACCOUNT_LINKING_POLICY,
  hasProviderCredentials,
  isExplicitlyEnabled,
  normalizeAuthMode,
  resolveAuthCapabilities,
} from './auth-policy';
import type { AuthCapabilities, AuthMode } from './auth-policy';

type BetterAuthSession = {
  session: { id: string; token: string; expiresAt: Date | string };
  user: {
    id: string;
    email: string;
    role?: string;
    isBanned?: boolean;
    banReason?: string | null;
    username?: string | null;
    usernameNeedsSetup?: boolean;
  };
};

type AuthenticateOptions = { required?: boolean };

type BetterAuthInstance = {
  handler: (request: globalThis.Request) => Promise<Response>;
  api: {
    getSession: (input: { headers: Headers }) => Promise<unknown>;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BetterAuthRuntime = Record<string, any>;

@Injectable()
export class BetterAuthService {
  private readonly logger = new Logger(BetterAuthService.name);
  private authInstance: BetterAuthInstance | null = null;
  private runtime: BetterAuthRuntime | null = null;
  private readonly secret: string;
  private readonly baseURL: string;
  private readonly secureCookies: boolean;
  private readonly cookieSameSite: 'lax' | 'strict' | 'none';
  private readonly cookieDomain?: string;
  private readonly trustedOrigins: string[];
  private readonly authMode: AuthMode;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {
    this.secret = this.configService.get<string>('BETTER_AUTH_SECRET') ?? '';
    if (!this.secret) throw new Error('BETTER_AUTH_SECRET must be configured');

    this.authMode = this.getAuthMode();
    this.secureCookies = this.getCookieSecure();
    this.cookieSameSite = this.getCookieSameSite();
    this.cookieDomain = this.getCookieDomain();
    this.trustedOrigins = this.getTrustedOrigins();

    this.baseURL =
      this.configService.get<string>('BETTER_AUTH_URL') ??
      'http://localhost:4000/auth';
  }

  private get auth(): BetterAuthInstance {
    if (!this.authInstance) {
      this.authInstance = this.createAuthInstance();
    }
    return this.authInstance;
  }

  private createAuthInstance(): BetterAuthInstance {
    const rt = this.getRuntime();

    return rt.betterAuth({
      baseURL: this.baseURL,
      basePath: '/auth',
      secret: this.secret,
      trustedOrigins: this.trustedOrigins,
      database: rt.drizzleAdapter(this.db, {
        provider: 'pg',
        usePlural: false,
        schema: {
          users: schema.users,
          accounts: schema.accounts,
          sessions: schema.sessions,
          verifications: schema.verifications,
        },
      }),
      emailAndPassword: {
        enabled: this.authMode !== 'github_only',
        autoSignIn: true,
        password: {
          hash: (password: string) => bcrypt.hash(password, 10),
          verify: ({ hash, password }: { hash: string; password: string }) =>
            bcrypt.compare(password, hash),
        },
      },
      emailVerification: {
        sendOnSignUp: false,
        autoSignInAfterVerification: true,
      },
      user: {
        modelName: 'users',
        fields: {
          name: 'displayName',
          image: 'avatarUrl',
          emailVerified: 'emailVerified',
        },
        additionalFields: {
          role: { type: 'string', input: false },
          isBanned: { type: 'boolean', input: false },
          banReason: { type: 'string', input: false, required: false },
          username: { type: 'string', input: true, required: false },
          usernameNeedsSetup: { type: 'boolean', input: false },
        },
      },
      session: {
        modelName: 'sessions',
        fields: {
          userId: 'userId',
          expiresAt: 'expiresAt',
          token: 'token',
          ipAddress: 'ipAddress',
          userAgent: 'userAgent',
        },
      },
      account: {
        modelName: 'accounts',
        fields: {
          userId: 'userId',
          accountId: 'accountId',
          providerId: 'providerId',
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          idToken: 'idToken',
          accessTokenExpiresAt: 'accessTokenExpiresAt',
          refreshTokenExpiresAt: 'refreshTokenExpiresAt',
          password: 'password',
        },
        accountLinking: ACCOUNT_LINKING_POLICY,
      },
      verification: { modelName: 'verifications' },
      socialProviders: this.buildSocialProviders(),
      databaseHooks: {
        user: {
          create: {
            before: async (user: {
              email: string;
              name?: string | null;
              username?: string | null;
            }) => {
              const base = this.normalizeUsername(
                user.username ?? user.name ?? user.email,
              );
              const username = await this.generateUniqueUsername(base);
              return {
                data: { ...user, username, usernameNeedsSetup: !user.username },
              };
            },
          },
        },
      },
      advanced: {
        database: { generateId: false },
        useSecureCookies: this.secureCookies,
        defaultCookieAttributes: {
          httpOnly: true,
          secure: this.secureCookies,
          sameSite: this.cookieSameSite,
          ...(this.cookieDomain ? { domain: this.cookieDomain } : {}),
        },
      },
    }) as BetterAuthInstance;
  }

  private getRuntime(): BetterAuthRuntime {
    if (this.runtime) return this.runtime;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const betterAuth = require('better-auth');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const drizzleAdapter = require('better-auth/adapters/drizzle');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeModule = require('better-auth/node');

    this.runtime = { ...betterAuth, ...drizzleAdapter, ...nodeModule };
    return this.runtime!;
  }

  handleAuthRequest(request: globalThis.Request): Promise<Response> {
    return this.auth.handler(request);
  }

  async getSessionFromRequest(req: Request): Promise<BetterAuthSession | null> {
    const { fromNodeHeaders } = this.getRuntime();
    const result = await this.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    const r = result as Partial<BetterAuthSession> | null;
    if (!r?.user?.id || !r.session) return null;
    return r as BetterAuthSession;
  }

  async authenticateRequest(
    req: Request,
    options: AuthenticateOptions = {},
  ): Promise<{ requestUser: TReqUser } | null> {
    const required = options.required !== false;
    const session = await this.getSessionFromRequest(req);

    if (!session?.user?.id) {
      if (required) throw new UnauthorizedException('Unauthorized');
      return null;
    }

    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, session.user.id),
      columns: { id: true, email: true, role: true, isBanned: true, banReason: true },
    });

    if (!user) {
      if (required) throw new UnauthorizedException('Unauthorized');
      return null;
    }

    if (user.isBanned) {
      throw new ForbiddenException({
        message: 'Your account has been banned',
        banReason: user.banReason ?? 'No reason provided',
        isBanned: true,
      });
    }

    return {
      requestUser: { userId: user.id, email: user.email, role: user.role ?? 'regular' },
    };
  }

  getCapabilities(): AuthCapabilities {
    return resolveAuthCapabilities({
      mode: this.authMode,
      githubCredentialsPresent: hasProviderCredentials(
        this.configService.get<string>('GITHUB_CLIENT_ID'),
        this.configService.get<string>('GITHUB_CLIENT_SECRET'),
      ),
      googleCredentialsPresent: hasProviderCredentials(
        this.configService.get<string>('GOOGLE_CLIENT_ID'),
        this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      ),
      googleAuthExplicitlyEnabled: isExplicitlyEnabled(
        this.configService.get<string>('GOOGLE_AUTH_ENABLED'),
      ),
    });
  }

  private buildSocialProviders() {
    const providers: Record<string, Record<string, unknown>> = {};
    const githubClientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const githubClientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
    if (hasProviderCredentials(githubClientId, githubClientSecret)) {
      providers.github = { clientId: githubClientId, clientSecret: githubClientSecret };
    }
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (
      this.authMode !== 'github_only' &&
      isExplicitlyEnabled(this.configService.get<string>('GOOGLE_AUTH_ENABLED')) &&
      hasProviderCredentials(googleClientId, googleClientSecret)
    ) {
      providers.google = { clientId: googleClientId, clientSecret: googleClientSecret };
    }
    return providers;
  }

  private getAuthMode(): AuthMode {
    const configured = this.configService.get<string>('AUTH_MODE');
    return normalizeAuthMode(configured) ?? 'hybrid';
  }

  private getCookieSecure(): boolean {
    const configured = this.configService.get<string>('SESSION_COOKIE_SECURE');
    if (configured === 'true') return true;
    if (configured === 'false') return false;
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  private getCookieSameSite(): 'lax' | 'strict' | 'none' {
    const configured = this.configService.get<string>('COOKIE_SAME_SITE');
    if (configured === 'lax' || configured === 'strict' || configured === 'none') {
      return configured;
    }
    return 'lax';
  }

  private getCookieDomain(): string | undefined {
    const domain = this.configService.get<string>('COOKIE_DOMAIN')?.trim();
    if (!domain) return undefined;
    return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  private getTrustedOrigins(): string[] {
    const origins = new Set<string>();
    const add = (raw: string | undefined) => {
      if (!raw) return;
      for (const o of raw.split(',')) {
        const n = o.trim();
        if (n) origins.add(n);
      }
    };
    add(this.configService.get<string>('TRUSTED_ORIGINS'));
    add(this.configService.get<string>('CORS_ALLOWED_ORIGINS'));
    add(this.configService.get<string>('FRONTEND_URL'));
    return Array.from(origins);
  }

  private normalizeUsername(value: string): string {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return normalized.length >= 3 ? normalized.slice(0, 50) : `user_${normalized}`.slice(0, 50);
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    for (let i = 0; i < 100; i++) {
      const suffix = i === 0 ? '' : `_${i}`;
      const candidate = `${base.slice(0, Math.max(1, 50 - suffix.length))}${suffix}`;
      const existing = await this.db.query.users.findFirst({
        where: eq(schema.users.username, candidate),
        columns: { id: true },
      });
      if (!existing) return candidate;
    }
    return `${base.slice(0, 40)}_${Date.now().toString().slice(-6)}`;
  }
}
