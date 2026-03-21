/** Stable test credentials — created once in global-setup, reused across all specs. */

export const TEST_CUSTOMER = {
  name: "E2E Customer",
  email: process.env.TEST_CUSTOMER_EMAIL || "e2e-customer@test.war9a.com",
  password: process.env.TEST_CUSTOMER_PASSWORD || "TestPass123!",
} as const;

export const TEST_OWNER = {
  name: "E2E Owner",
  email: process.env.TEST_OWNER_EMAIL || "e2e-owner@test.war9a.com",
  password: process.env.TEST_OWNER_PASSWORD || "TestPass123!",
} as const;

export const TEST_WORKER = {
  name: "E2E Worker",
  email: process.env.TEST_WORKER_EMAIL || "e2e-worker@test.war9a.com",
  password: process.env.TEST_WORKER_PASSWORD || "TestPass123!",
} as const;

export const TEST_ADMIN = {
  name: "E2E Admin",
  email: process.env.TEST_ADMIN_EMAIL || "e2e-admin@test.war9a.com",
  password: process.env.TEST_ADMIN_PASSWORD || "TestPass123!",
} as const;

export const TEST_BUSINESS = {
  name: "E2E Test Clinic",
  description: "A test business created for end-to-end testing",
  location: "123 Test Street, Annaba",
  city: "annaba",
  phone: "0555123456",
} as const;

export const TEST_SERVICE = {
  name: "General Consultation",
  description: "Standard consultation service for E2E tests",
  averageTime: 10,
  maxCapacity: 50,
} as const;

export const TEST_GUICHET = {
  name: "Window 1",
} as const;

export const CITIES = [
  "Annaba",
  "Algiers",
  "Oran",
  "Constantine",
  "Setif",
  "Batna",
] as const;
