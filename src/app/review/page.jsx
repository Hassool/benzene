"use client";

import { motion } from "framer-motion";
import { SiReact, SiNextdotjs, SiTailwindcss, SiMongodb, SiFramer, SiAuth0, SiCloudinary, SiSocketdotio, SiGithub } from "react-icons/si";
import { TbMathFunction, TbBrandOauth } from "react-icons/tb";
import { FiCode, FiDatabase, FiLayout, FiCpu, FiPackage, FiGlobe } from "react-icons/fi";
import DependencyCard from "@/components/review/DependencyCard";
import ApiDoc from "@/components/review/ApiDoc";
import ColorPalette from "@/components/review/ColorPalette";
import mermaid from "mermaid";
import { useEffect } from "react";
import { ServerCog } from "lucide-react";
import { useTranslation } from "l_i18n";

export default function ReviewPage() {
  const { t, isRTL } = useTranslation();
  
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
    mermaid.contentLoaded();
  }, []);

  const dependencies = [
    {
      name: t("review.dependencies.l18n.name"),
      description: t("review.dependencies.l18n.desc"),
      icon: FiGlobe,
      link: "https://l-i18n-docs.vercel.app/"
    },
    {
      name: t("review.dependencies.react.name"),
      description: t("review.dependencies.react.desc"),
      icon: SiReact,
      link: "https://react.dev"
    },
    {
      name: t("review.dependencies.next.name"),
      description: t("review.dependencies.next.desc"),
      icon: SiNextdotjs,
      link: "https://nextjs.org"
    },
    {
      name: t("review.dependencies.tailwind.name"),
      description: t("review.dependencies.tailwind.desc"),
      icon: SiTailwindcss,
      link: "https://tailwindcss.com"
    },
    {
      name: t("review.dependencies.mongo.name"),
      description: t("review.dependencies.mongo.desc"),
      icon: SiMongodb,
      link: "https://mongoosejs.com"
    },
    {
      name: t("review.dependencies.auth.name"),
      description: t("review.dependencies.auth.desc"),
      icon: TbBrandOauth,
      link: "https://next-auth.js.org"
    },
    {
      name: t("review.dependencies.math.name"),
      description: t("review.dependencies.math.desc"),
      icon: TbMathFunction,
      link: "https://mathjs.org"
    },
    {
      name: t("review.dependencies.framer.name"),
      description: t("review.dependencies.framer.desc"),
      icon: SiFramer,
      link: "https://www.framer.com/motion/"
    },
    {
      name: t("review.dependencies.cloudinary.name"),
      description: t("review.dependencies.cloudinary.desc"),
      icon: SiCloudinary,
      link: "https://cloudinary.com"
    }
  ];

  const secondaryDependencies = [
    t("review.secondaryDeps.cheerio"),
    t("review.secondaryDeps.bcrypt"),
    t("review.secondaryDeps.lucide"),
    t("review.secondaryDeps.toast"),
    t("review.secondaryDeps.pdf")
  ];

  return (
    <div className={`min-h-screen bg-bg dark:bg-bg-dark text-text dark:text-text-dark p-6 pb-24 ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-12"
        >
            <h1 className="text-5xl font-bold font-orbitron mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                {t("review.header.title")}
            </h1>
            <p className="text-xl text-text-secondary dark:text-text-dark-secondary font-inter max-w-2xl mx-auto">
                {t("review.header.description")}
            </p>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center gap-6 -mt-16"
        >
             <p className="text-xl text-text-secondary dark:text-text-dark-secondary font-inter max-w-2xl mx-auto text-center leading-relaxed">
                {t("review.header.projectDescription")}
            </p>
            
            <a 
              href="https://github.com/Hassool/benzene" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full font-bold font-montserrat flex items-center gap-3 hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
            >
              <SiGithub className="text-2xl" />
              {t("review.header.github")}
            </a>
        </motion.div>

        {/* Section 1: Dependencies */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <FiPackage className="text-3xl text-blue-500" />
            <h2 className="text-3xl font-bold font-montserrat">{t("review.sections.stack")}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             {dependencies.map((dep, i) => (
               <DependencyCard key={i} {...dep} />
             ))}
          </div>

          <div className="bg-bg-secondary dark:bg-bg-dark-secondary p-6 rounded-xl border border-border dark:border-border-dark">
             <h3 className="text-lg font-bold mb-4 font-rajdhani">{t("review.sections.otherLibs")}</h3>
             <div className="flex flex-wrap gap-3">
               {secondaryDependencies.map((dep, i) => (
                 <span key={i} className="px-3 py-1 bg-white dark:bg-bg-dark rounded-full border border-border dark:border-border-dark text-sm font-mono text-text-secondary dark:text-text-dark-secondary">
                   {dep}
                 </span>
               ))}
             </div>
          </div>
        </section>

        {/* Section 2: Backend API */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <ServerCog className="text-3xl text-green-500" />
            <h2 className="text-3xl font-bold font-montserrat">{t("review.sections.backend")}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               <ApiDoc 
                 method="GET"
                 route="/api/balance"
                 description={t("review.api.balanceDesc")}
                 input={{ equation: "Ca(OH)2+H3PO4=Ca3(PO4)2+H2O" }}
                 output={{ success: true, balanced: "3Ca(OH)2+2H3PO4=1Ca3(PO4)2+6H2O" }} 
                 inputLabel={t("review.api.input")}
                 outputLabel={t("review.api.output")}
               />
               <ApiDoc 
                 method="POST"
                 route="/api/auth/register"
                 description={t("review.api.registerDesc")}
                 input={{ email: "user@example.com", password: "***", name: "Student" }}
                 output={{ success: true, message: "User created" }} 
                 inputLabel={t("review.api.input")}
                 outputLabel={t("review.api.output")}
               />
                <ApiDoc 
                 method="GET"
                 route="/api/course/[id]"
                 description={t("review.api.courseDesc")}
                 input={{ id: "65b..." }}
                 output={{ title: "Chemistry 101", resources: ["..."] }} 
                 inputLabel={t("review.api.input")}
                 outputLabel={t("review.api.output")}
               />
            </div>
            
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-bg-dark-secondary p-6 rounded-xl border border-border dark:border-border-dark shadow-sm sticky top-6">
                    <h3 className="text-xl font-bold mb-4 font-rajdhani flex items-center gap-2">
                        <FiCpu /> {t("review.sections.apiFlow")}
                    </h3>
                    <div className="mermaid text-sm overflow-x-auto bg-white dark:bg-bg-dark rounded-lg">
{`sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Enters Chemical Equation
    Frontend->>API: GET /api/balance?eq=...
    API->>API: Parse Molecule
    API->>API: Build Matrix
    API->>API: Solve (Gaussian Elim)
    API-->>Frontend: JSON Response
    Frontend-->>User: Show Balanced Result
`}
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Section 3: UI Design System */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <FiLayout className="text-3xl text-purple-500" />
            <h2 className="text-3xl font-bold font-montserrat">{t("review.sections.ui")}</h2>
          </div>

          <div className="bg-bg-secondary/30 dark:bg-bg-dark-secondary/10 p-8 rounded-2xl border border-border dark:border-border-dark">
             <div className="mb-12">
                <h3 className="text-xl font-bold mb-6 font-rajdhani flex items-center gap-2 border-b pb-2 border-border dark:border-border-dark">
                   <FiCode /> {t("review.sections.colors")}
                </h3>
                <ColorPalette t={t} />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                   <h3 className="text-xl font-bold mb-6 font-rajdhani flex items-center gap-2 border-b pb-2 border-border dark:border-border-dark">
                      {t("review.sections.typography")}
                   </h3>
                   <div className="space-y-6">
                       <div>
                           <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2 font-mono">{t("review.headings.orbitron")}</p>
                           <h1 className="text-4xl font-bold font-orbitron mb-2">The Quick Brown Fox</h1>
                           <h2 className="text-2xl font-bold font-montserrat">Jumps Over The Lazy Dog</h2>
                       </div>
                       <div>
                           <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2 font-mono">{t("review.headings.body")}</p>
                           <p className="font-inter leading-relaxed">
                               Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                           </p>
                       </div>
                       <div>
                           <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2 font-mono">{t("review.headings.code")}</p>
                           <p className="font-mono bg-bg-secondary dark:bg-bg-dark-secondary p-2 rounded">
                               const x = 123;
                           </p>
                       </div>
                   </div>
                </div>
                
                <div>
                   <h3 className="text-xl font-bold mb-6 font-rajdhani flex items-center gap-2 border-b pb-2 border-border dark:border-border-dark">
                      {t("review.sections.interactive")}
                   </h3>
                   <div className="flex flex-col gap-4 items-start">
                       <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all font-montserrat">
                           {t("review.interactive.primary")}
                       </button>
                       <button className="px-6 py-3 bg-white dark:bg-bg-dark border border-border dark:border-border-dark hover:border-blue-500 text-text dark:text-text-dark rounded-lg font-bold transition-all font-montserrat">
                           {t("review.interactive.secondary")}
                       </button>
                       <div className="w-full">
                           <input 
                              type="text" 
                              placeholder={t("review.interactive.inputPlaceholder")}
                              className="w-full px-4 py-3 bg-bg dark:bg-bg-dark-secondary border border-border dark:border-border-dark rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-inter"
                           />
                       </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
