export interface FileDTO {
    id: number;
    path: string;
    name: string;
    size: number;
    type: string;
    createdAt: string;
    updatedAt?: string;
}

export interface VersionSummaryDTO {
    fileId: number;
    versionNumber: number;
    createdAt: string;
    totalLines: number;
    changedLines: number[];
}

export interface VersionContentDTO extends VersionSummaryDTO {
    content: string;
}

export interface AddFileInput {
    path: string;
    content: string;
}

export interface CreateVersionInput {
    content: string;
}
