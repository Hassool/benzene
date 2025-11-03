// src/translations/index.js
import { buildModuleConfig } from "react-lite-translation";

import { CoursesAR, CoursesEN } from "./courses";
import { MainEN, MainAR } from "./main";
import { NavAR, NavEN } from "./nav";
import { FooterEN, FooterAR } from "./footer";
import { DashNavEN, DashNavAR } from "./dashNav";
import { ProfileEN , ProfileAR } from "./profile";
import { CheckEN, CheckAR } from "./check";
import { SectionEn, SectionAR } from "./Section";
import { ResCardEN, ResCardAR } from "./ResCard";
import { CoursePageEn, CoursePageAR } from "./coursePage";
import { ToolsEN, ToolsAR } from "./tools";

export const modules = buildModuleConfig({
    main:{ en : MainEN, ar: MainAR},
    nav:{ en : NavEN, ar: NavAR},
    courses:{ en : CoursesEN, ar: CoursesAR},
    footer:{ en : FooterEN, ar: FooterAR},
    dashNav:{ en : DashNavEN, ar: DashNavAR},
    profile:{ en : ProfileEN, ar: ProfileAR},
    check:{ en : CheckEN, ar: CheckAR},
    section:{ en : SectionEn, ar: SectionAR},
    resCard:{ en : ResCardEN, ar: ResCardAR},
    coursePage:{ en : CoursePageEn, ar: CoursePageAR},
    tools:{ en : ToolsEN, ar: ToolsAR}
});