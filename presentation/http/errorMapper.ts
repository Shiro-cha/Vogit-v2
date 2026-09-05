import {
    DomainError,
    FileNotFoundError,
    VersionNotFoundError,
    InvalidFileError,
    DuplicateContentError,
    StorageError,
} from "../../domain/file/errors/DomainErrors";

/**
 * Maps domain/application errors to HTTP status codes so that internal
 * error details (e.g. a raw Postgres error) never leak through the API.
 */
export function mapErrorToStatus(error: unknown): { status: number; message: string } {
    if (error instanceof FileNotFoundError || error instanceof VersionNotFoundError) {
        return { status: 404, message: error.message };
    }
    if (error instanceof InvalidFileError) {
        return { status: 400, message: error.message };
    }
    if (error instanceof DuplicateContentError) {
        return { status: 409, message: error.message };
    }
    if (error instanceof StorageError) {
        return { status: 502, message: "A storage error occurred." };
    }
    if (error instanceof DomainError) {
        return { status: 400, message: error.message };
    }
    console.error("Unhandled error:", error);
    return { status: 500, message: "Internal server error." };
}
