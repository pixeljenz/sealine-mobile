// ONB-1.0 — Mock API layer for onboarding.
// Stands in for the real Supabase-backed auth flow until live backend work lands.
// All state is in-memory and resets on app restart.

type SendOtpResult = { success: true };
type VerifyOtpResult =
  | { status: 'success' }
  | { status: 'wrong_code'; attemptsRemaining: number }
  | { status: 'locked_out'; secondsRemaining: number };

const RESEND_COOLDOWN_MS = 30_000;
const LOCKOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;
const MOCK_CORRECT_CODE = '123456';

const REGISTERED_NUMBERS = new Set<string>(['+911234567890']);

type OtpSession = {
  phoneNumber: string;
  sentAt: number;
  attemptsUsed: number;
  lockedUntil: number | null;
};

let activeSession: OtpSession | null = null;

function now() {
  return Date.now();
}

export const mockOnboardingApi = {
  async isNumberRegistered(phoneNumber: string): Promise<boolean> {
    await delay(300);
    return REGISTERED_NUMBERS.has(phoneNumber);
  },

  async sendOtp(phoneNumber: string): Promise<SendOtpResult> {
    await delay(400);

    if (activeSession?.phoneNumber === phoneNumber) {
      const elapsed = now() - activeSession.sentAt;
      if (elapsed < RESEND_COOLDOWN_MS) {
        throw new Error('RESEND_COOLDOWN_ACTIVE');
      }
    }

    activeSession = {
      phoneNumber,
      sentAt: now(),
      attemptsUsed: 0,
      lockedUntil: null,
    };

    return { success: true };
  },

  async verifyOtp(phoneNumber: string, code: string): Promise<VerifyOtpResult> {
    await delay(400);

    if (!activeSession || activeSession.phoneNumber !== phoneNumber) {
      throw new Error('NO_ACTIVE_SESSION');
    }

    if (activeSession.lockedUntil && now() < activeSession.lockedUntil) {
      return {
        status: 'locked_out',
        secondsRemaining: Math.ceil((activeSession.lockedUntil - now()) / 1000),
      };
    }

    if (code === MOCK_CORRECT_CODE) {
      activeSession = null;
      return { status: 'success' };
    }

    activeSession.attemptsUsed += 1;
    const attemptsRemaining = MAX_ATTEMPTS - activeSession.attemptsUsed;

    if (attemptsRemaining <= 0) {
      activeSession.lockedUntil = now() + LOCKOUT_MS;
      return { status: 'locked_out', secondsRemaining: LOCKOUT_MS / 1000 };
    }

    return { status: 'wrong_code', attemptsRemaining };
  },

  clearSession(): void {
    activeSession = null;
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}