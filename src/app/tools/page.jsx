// src/app/tools/page.jsx
"use client"

import { GiChemicalDrop, GiChemicalTank, GiTable } from "react-icons/gi";
import { SiConvertio } from "react-icons/si";
import Link from "next/link";
import { useTranslation } from "@/lib/TranslationProvider";
import { FunctionSquare } from "lucide-react";

const NavList = [
  {
    name: "Chemical Equation Balancer",
    nameAR: "موازن المعادلات الكيميائية",
    icon: <GiChemicalDrop />,
    path: "/tools/ceb",
    description: "Balance chemical equations instantly with our intelligent algorithm. Simply input your unbalanced equation and get the correct stoichiometric coefficients.",
    descriptionAR: "وازن المعادلات الكيميائية فورًا باستخدام خوارزمية ذكية. ما عليك سوى إدخال معادلتك غير المتوازنة لتحصل على المعاملات الصحيحة.",
    color: "from-blue-500 to-cyan-400",
    darkColor: "dark:from-blue-400 dark:to-cyan-300",
    hoverColor: "hover:from-blue-600 hover:to-cyan-500",
    darkHoverColor: "dark:hover:from-blue-500 dark:hover:to-cyan-400",
    iconColor: "text-blue-400 dark:text-blue-300",
    bgGradient: "bg-gradient-to-br from-blue-500/10 to-cyan-400/10 dark:from-blue-400/10 dark:to-cyan-300/10"
  },
  {
    name: "Unit Converter", 
    nameAR: "محول الوحدات",
    icon: <SiConvertio />,
    path: "/tools/converter",
    description: "Convert between different units of measurement including mass, volume, temperature, pressure, and concentration for all your chemistry calculations.",
    descriptionAR: "حوّل بين مختلف الوحدات مثل الكتلة، الحجم، درجة الحرارة، الضغط والتركيز لمساعدتك في جميع حسابات الكيمياء.",
    color: "from-emerald-500 to-green-400",
    darkColor: "dark:from-emerald-400 dark:to-green-300",
    hoverColor: "hover:from-emerald-600 hover:to-green-500",
    darkHoverColor: "dark:hover:from-emerald-500 dark:hover:to-green-400",
    iconColor: "text-emerald-400 dark:text-emerald-300",
    bgGradient: "bg-gradient-to-br from-emerald-500/10 to-green-400/10 dark:from-emerald-400/10 dark:to-green-300/10"
  },
  {
    name: "2D Lab",
    nameAR: "المعمل ثنائي الأبعاد",
    icon: <GiChemicalTank />,
    path: "/tools/2dlab", 
    description: "Visualize and simulate chemical reactions in a virtual 2D laboratory environment. Perfect for understanding molecular interactions and reaction mechanisms.",
    descriptionAR: "تصوّر وحاكي التفاعلات الكيميائية في معمل افتراضي ثنائي الأبعاد. مثالي لفهم التفاعلات الجزيئية وآليات التفاعل.",
    color: "from-purple-500 to-pink-400",
    darkColor: "dark:from-purple-400 dark:to-pink-300",
    hoverColor: "hover:from-purple-600 hover:to-pink-500",
    darkHoverColor: "dark:hover:from-purple-500 dark:hover:to-pink-400",
    iconColor: "text-purple-400 dark:text-purple-300",
    bgGradient: "bg-gradient-to-br from-purple-500/10 to-pink-400/10 dark:from-purple-400/10 dark:to-pink-300/10"
  },
  {
    name: "Function Graph Drawer",
    nameAR: "رَسّام الدوال",
    icon: <FunctionSquare />,
    path: "/tools/FGD",
    description: "Draw mathematical function graphs interactively. Visualize equations, analyze shapes, and explore their behavior dynamically.",
    descriptionAR: "ارسم منحنيات الدوال الرياضية بطريقة تفاعلية. تصوّر المعادلات وحلّل الأشكال واستكشف سلوكها ديناميكيًا.",
    color: "from-orange-500 to-yellow-400",
    darkColor: "dark:from-orange-400 dark:to-yellow-300",
    hoverColor: "hover:from-orange-600 hover:to-yellow-500",
    darkHoverColor: "dark:hover:from-orange-500 dark:hover:to-yellow-400",
    iconColor: "text-orange-400 dark:text-yellow-300",
    bgGradient: "bg-gradient-to-br from-orange-500/10 to-yellow-400/10 dark:from-orange-400/10 dark:to-yellow-300/10"
  },
  {
    name: "Periodic Table",
    nameAR: "الجدول الدوري",
    icon: <GiTable />,
    path: "/tools/PT",
    description: "Explore the periodic table with detailed information about each element, including atomic number, mass, and chemical properties.",
    descriptionAR: "استكشف الجدول الدوري مع معلومات مفصلة عن كل عنصر مثل العدد الذري، الكتلة والخصائص الكيميائية.",
    color: "from-pink-500 to-red-400",
    darkColor: "dark:from-pink-400 dark:to-red-300",
    hoverColor: "hover:from-pink-600 hover:to-red-500",
    darkHoverColor: "dark:hover:from-pink-500 dark:hover:to-red-400",
    iconColor: "text-pink-400 dark:text-red-300",
    bgGradient: "bg-gradient-to-br from-pink-500/10 to-red-400/10 dark:from-pink-400/10 dark:to-red-300/10"
  }
];


export default async function page() {
  const { t,isRTL, isLoading } = useTranslation();

  return (
    <div className="font-sans min-h-screen bg-bg dark:bg-bg-dark p-8 pb-20 sm:p-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text dark:text-text-dark mb-4 font-montserrat">
            {!isRTL?"Tools Hub":"مركز الأدوات"}
          </h1>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {NavList.map((item, index) => (
            <div
              key={item.name}
              className={`${item.bgGradient} rounded-xl p-6 border border-border dark:border-border-dark hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-4xl ${item.iconColor} transition-all duration-200`}>
                  {item.icon}
                </div>
                <h2 className="text-xl font-semibold text-text dark:text-text-dark font-montserrat">
                  {isRTL ? item.nameAR : item.name}
                </h2>
              </div>
              
              <p className="text-text-secondary dark:text-text-dark-secondary text-sm leading-relaxed mb-6 font-inter">
                {isRTL ? item.descriptionAR : item.description}
              </p>
              
              <Link href={item.path}>
                <button className={`w-full bg-gradient-to-r ${item.color} ${item.darkColor} ${item.hoverColor} ${item.darkHoverColor} text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg dark:focus:ring-offset-bg-dark focus:ring-blue-500 font-montserrat`}>
                  {!isRTL?"Launch Tool":"شغل هذه الأداة"}
                </button>
              </Link>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}