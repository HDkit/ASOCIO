// @ts-check
import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import eslint from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['eslint.config.mjs'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	eslintPluginPrettierRecommended,
	eslintNestJs.configs.flatRecommended,
	eslintNestJs.configs.flatNoSwagger,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},
			ecmaVersion: 5,
			sourceType: 'module',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		plugins: { perfectionist },
		rules: {
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@darraghor/nestjs-typed/injectable-should-be-provided': 'off',
			'perfectionist/sort-decorators': [
				'error',
				{
					type: 'alphabetical',
					order: 'asc',
					fallbackSort: { type: 'unsorted' },
					ignoreCase: true,
					specialCharacters: 'keep',
					groups: [
						'version',
						'method',
						'guard',
						'interceptor',
						'pipe',
						'filter',
						'class-transformer',
						'class-validator',
						'unknown',
						'module',
						'controller',
						'injectable',
					],
					customGroups: {
						version: '^Version$',
						method: ['^Get$', '^Post$', '^Put$', '^Delete$', '^Patch$', '^Options$', '^Head$'],
						guard: '^UseGuards$',
						interceptor: '^UseInterceptors$',
						pipe: '^UsePipes$',
						filter: '^UseFilters$',
						'class-transformer': ['^Exclude$', '^Expose$', '^Transform$', '^Type$'],
						'class-validator': ['Is.*', 'Max.*', 'Min.*', 'Validate.*', 'Has.*'],
						module: '^Module$',
						controller: '^Controller$',
						injectable: '^Injectable$',
					},
					sortOnClasses: true,
					sortOnMethods: true,
					sortOnAccessors: true,
					sortOnProperties: true,
					sortOnParameters: true,
				},
			],
			'prettier/prettier': [
				'error',
				{
					endOfLine: 'auto',
				},
			],
		},
	},
);
