import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { MemoryStoredFile } from 'nestjs-form-data';
import { firstValueFrom } from 'rxjs';

import { IEnvVars } from '@configs/config';

export interface FileUploadResponse {
	fileId: string;
	name: string;
	filePath: string;
	url: string;
	size: number;
	/** Send tags in responseFields in API request to get the value of this field. */
	tags?: string[] | null;

	versionInfo: {
		id: string;
		name: string;
	};
	/** Send isPrivateFile in responseFields in API request to get the value of this field. */
	isPrivateFile?: boolean;
	/** Send isPublished in responseFields in API request to get the value of this field. */
	isPublished?: boolean;

	fileType: 'image' | 'non-image';
}

export interface ImageUploadResponse extends FileUploadResponse {
	thumbnailUrl: string;
	height: number;
	width: number;
}

export interface VideoUploadResponse extends FileUploadResponse {
	bitRate: number;
	/** Duration in seconds */
	duration: number;
	audioCodec: string;
	videoCodec: string;
}

@Injectable()
export class FileHostService {
	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService<IEnvVars>,
	) {}

	/** Returns URL to the image */
	async file2Url(file: MemoryStoredFile): Promise<string> {
		// init formdata
		const formData = new FormData();
		formData.append('file', file.buffer, {
			filename: file.originalName,
			contentType: file.mimetype,
		});
		formData.append('fileName', file.originalName);

		// axios request
		const { data } = await firstValueFrom(
			this.httpService.post<FileUploadResponse>('/api/v1/files/upload', formData, {
				headers: {
					Authorization: `Basic ${this.configService.get('imgKitKey')}`,
					'Content-Type': 'multipart/form-data',
				},
			}),
		);

		return data.url;
	}

	async files2Urls(files: MemoryStoredFile[]): Promise<string[]> {
		const urls = await Promise.all(files.map(f => this.file2Url(f)));
		return urls;
	}
}
