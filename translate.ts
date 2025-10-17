// app/utils/translate.ts
export async function lingvaTranslate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
      const res = await fetch(
        `https://lingva.ml/api/v1/${sourceLang}/${targetLang}/${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data?.translation || '';
    } catch (error) {
      console.error('Lingva Translate Error:', error);
      return '';
    }
  }
  