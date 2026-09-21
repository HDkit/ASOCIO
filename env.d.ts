/// <reference types="node" />

// Declare env variables here.

declare namespace NodeJS {
	interface ProcessEnv {
		readonly NODE_ENV: 'development' | 'production';
		readonly PORT: number;
		readonly DATABASE_URI: string;
		readonly JWT_SECRET: string;
		readonly JWT_REFRESH_SECRET: string;
		readonly JWT_ACCESS_TOKEN_EXPIRATION: string | number;
		readonly JWT_REFRESH_TOKEN_EXPIRATION: string | number;
		readonly IMGKIT_API_PRIVATE_KEY: string;
		readonly GOOGLE_OA2_CLIENT_ID: string;
		readonly GOOGLE_OA2_CLIENT_SECRET: string;
	}
}
