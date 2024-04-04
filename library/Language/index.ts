import { computed, inject } from 'vue';
import { LangString } from './en';
import { LangString as LangStringZh } from './zh';
import type { CodeLayoutLangConfig } from '../CodeLayout';

export type CodeLayoutLangDefine = typeof LangString;

const internalLangs = {
  'en': LangString,
  'zh': LangStringZh,
} as Record<string, CodeLayoutLangDefine>;

/**
 * Add custom lang to CodeLayout language, should be called before CodeLayout component create.
 * @param lang Lang name
 * @param strings Content
 */
export function addCodeLayoutLang(lang: string, strings: CodeLayoutLangDefine) {
  internalLangs[lang] = strings;
}

/**
 * CodeLayout language string wrapper
 * @returns 
 */
export function useCodeLayoutLang() {

  const langConfig = inject('codeLayoutLangConfig') as CodeLayoutLangConfig;
  const langStrings = computed(() => {
    return {
      ...internalLangs[langConfig.lang],
      ...langConfig.stringsOverride,
    };
  });

  function t(key: keyof CodeLayoutLangDefine) {
    return langStrings.value[key] || key;
  }

  return {
    t,
  }
}