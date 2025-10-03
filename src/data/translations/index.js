// src/data/translations/index.js
import { CoursesAR, CoursesEN } from "./modules/courses";
import { MainEN, MainAR } from "./modules/main";
import { NavAR, NavEN } from "./modules/nav";
import { HonorEN, HonorAR } from "./modules/honor";
import { FooterEN, FooterAR } from "./modules/footer";
// helpers


function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

export function deepEqual(a, b) {
  if (a === b) return true;
  if (!isObject(a) || !isObject(b)) return false;
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.length !== bk.length) return false;
  for (let k of ak) {
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
} 

export function deepMerge(base, override) {
  if (!isObject(base)) return override === undefined ? base : override;
  if (!isObject(override)) return override === undefined ? base : override;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(override)) {
    const vBase = out[key];
    const vOverride = override[key];
    if (isObject(vBase) && isObject(vOverride)) {
      out[key] = deepMerge(vBase, vOverride);
    } else {
      out[key] = vOverride;
    }
  }
  return out;
}

// Build module configs from your pair exports
function buildModuleConfig(en, ar) {
  if (deepEqual(en, ar)) {
    return { default: en }; // shared content -> only default
  }
  return { default: en, ar }; // per-lang override present
}

export const modules = {
  main: buildModuleConfig(MainEN, MainAR),
  nav: buildModuleConfig(NavEN, NavAR),
  courses: buildModuleConfig(CoursesEN, CoursesAR),
  honor: buildModuleConfig(HonorEN, HonorAR),
  footer: buildModuleConfig(FooterEN, FooterAR),
};
