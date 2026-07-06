import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import pluginVitest from '@vitest/eslint-plugin';
import pluginOxlint from 'eslint-plugin-oxlint';
import skipFormatting from 'eslint-config-prettier/flat';

export default defineConfig([
    {
        name: 'app/files-to-lint',
        files: ['**/*.{vue,js,mjs,jsx}'],
    },

    globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ElMessage: 'readonly', // 声明 ElMessage 为全局变量
                ElMessageBox: 'readonly',
                ElLoading: 'readonly',
                ElNotification: 'readonly',
            },
        },
        rules: {
            // 关闭组件命名规则
            'vue/multi-word-component-names': 'off',
        },
    },

    js.configs.recommended,
    ...pluginVue.configs['flat/essential'],

    {
        ...pluginVitest.configs.recommended,
        files: ['src/**/__tests__/*'],
    },

    ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

    skipFormatting,
    {
        extends: ['prettier'], // 不会去校验插件上的内容
    },
]);
