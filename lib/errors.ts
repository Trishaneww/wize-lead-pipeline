export class AppError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class AnthropicError extends AppError {}
export class AnthropicParseError extends AnthropicError {}

export class PlacesError extends AppError {}
export class PlacesQuotaError extends PlacesError {}

export class PageSpeedError extends AppError {}

export class SiteFetchError extends AppError {}

export class GmailError extends AppError {}
export class GmailAuthError extends GmailError {}
