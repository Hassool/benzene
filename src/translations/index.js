// src/translations/index.js
import { buildModuleConfig } from "l_i18n";

import { CoursesAR, CoursesEN, CoursesFR } from "./courses";
import { MainEN, MainAR, MainFR } from "./main";
import { NavAR, NavEN, NavFR } from "./nav";
import { FooterEN, FooterAR, FooterFR } from "./footer";
import { DashNavEN, DashNavAR, DashNavFR } from "./dashNav";
import { ProfileEN , ProfileAR, ProfileFR } from "./profile";
import { CheckEN, CheckAR, CheckFR } from "./check";

import { ResCardEN, ResCardAR, ResCardFR } from "./ResCard";
import { CoursePageEn, CoursePageAR, CoursePageFR } from "./coursePage";
import { ToolsEN, ToolsAR, ToolsFR } from "./tools";

export const modules = buildModuleConfig({
    main:{ en : MainEN, ar: MainAR, fr: MainFR},
    nav:{ en : NavEN, ar: NavAR, fr: NavFR},
    courses:{ en : CoursesEN, ar: CoursesAR, fr: CoursesFR},
    footer:{ en : FooterEN, ar: FooterAR, fr: FooterFR},
    dashNav:{ en : DashNavEN, ar: DashNavAR, fr: DashNavFR},
    profile:{ en : ProfileEN, ar: ProfileAR, fr: ProfileFR},
    check:{ en : CheckEN, ar: CheckAR, fr: CheckFR},

    resCard:{ en : ResCardEN, ar: ResCardAR, fr: ResCardFR},
    coursePage:{ en : CoursePageEn, ar: CoursePageAR, fr: CoursePageFR},
    tools:{ en : ToolsEN, ar: ToolsAR, fr: ToolsFR}
});