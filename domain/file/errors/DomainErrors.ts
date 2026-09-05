/**
 * Domain/application level errors for Vogit.
 * Presentation layer maps these to HTTP responses; infrastructure
 * errors (e.g. Postgres errors) must never leak past the repositories.
 */

export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class FileNotFoundError extends DomainError {
    constructor(identifier: string | number) {
        super(`File not found: ${identifier}`);
    }
}

export class VersionNotFoundError extends DomainError {
    constructor(fileId: number, versionNumber: number) {
        super(`Version ${versionNumber} not found for file ${fileId}`);
    }
}

export class InvalidFileError extends DomainError {
    constructor(message: string) {
        super(message);
    }
}

export class DuplicateContentError extends DomainError {
    constructor(message: string = "Content is identical to the current version") {
        super(message);
    }
}

export class StorageError extends DomainError {
    constructor(message: string, readonly cause?: unknown) {
        super(message);
    }
}
