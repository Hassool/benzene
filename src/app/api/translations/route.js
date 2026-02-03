// src/app/api/translations/route.js
import { modules } from "@/translations";

// Re-export deepMerge for use (or reimplement here)
function isObject(v) { return v && typeof v === "object" && !Array.isArray(v); }
function deepMergeLocal(base, override) {
  if (!isObject(base)) return override === undefined ? base : override;
  if (!isObject(override)) return override === undefined ? base : override;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(override)) {
    const vBase = out[key];
    const vOverride = override[key];
    if (isObject(vBase) && isObject(vOverride)) {
      out[key] = deepMergeLocal(vBase, vOverride);
    } else {
      out[key] = vOverride;
    }
  }
  return out;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get("lang") || "en").toLowerCase();
    const moduleName = searchParams.get("module"); // optional

    const supportedLangs = ["en", "ar", "fr"];
    const chosenLang = supportedLangs.includes(lang) ? lang : "en";

    function buildForLang(modConfig, lang) {
      // Direct access strategy since modules seem to be { en: {...}, ar: {...}, fr: {...} }
      // If buildModuleConfig adds a 'default' key that points to 'en', we could use that,
      // but let's be explicit and robust.
      
      // If the specific language exists, use it.
      if (modConfig[lang]) return modConfig[lang];
      
      // Fallback to 'en' if the requested language is missing
      if (modConfig['en']) return modConfig['en'];
      
      // Fallback to 'default' if it exists (l_i18n might add this)
      if (modConfig.default) return modConfig.default;

      return {}; 
    }

    if (moduleName) {
      const mod = modules[moduleName];
      if (!mod) return Response.json({ error: "unknown module" }, { status: 400 });
      const payload = buildForLang(mod, chosenLang);
      return Response.json({ [moduleName]: payload }, { status: 200 });
    }

    // build full locale (all modules)
    const payload = {};
    for (const [name, mod] of Object.entries(modules)) {
      payload[name] = buildForLang(mod, chosenLang);
    }

    return Response.json(payload, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" } // Disable cache for dev
    });
  } catch (err) {
    console.error("Translation API error:", err);
    return Response.json({ error: "server error" }, { status: 500 });
  }
}
