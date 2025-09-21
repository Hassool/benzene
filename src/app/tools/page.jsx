// src/app/tools/page.jsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import authOptions from "@/app/api/auth/[...nextauth]/route";

import { GiChemicalDrop, GiChemicalTank } from "react-icons/gi";
import { SiConvertio } from "react-icons/si";
import Link from "next/link";

const NavList = [
  {
    name: "Chemical Equation Balancer",
    icon: <GiChemicalDrop />,
    path: "/tools/ceb",
    description: "Balance chemical equations instantly with our intelligent algorithm. Simply input your unbalanced equation and get the correct stoichiometric coefficients.",
    color: "from-blue-500 to-cyan-400",
    darkColor: "dark:from-blue-400 dark:to-cyan-300",
    hoverColor: "hover:from-blue-600 hover:to-cyan-500",
    darkHoverColor: "dark:hover:from-blue-500 dark:hover:to-cyan-400",
    iconColor: "text-blue-400 dark:text-blue-300",
    bgGradient: "bg-gradient-to-br from-blue-500/10 to-cyan-400/10 dark:from-blue-400/10 dark:to-cyan-300/10"
  },
  {
    name: "Unit Converter", 
    icon: <SiConvertio />,
    path: "/tools/converter",
    description: "Convert between different units of measurement including mass, volume, temperature, pressure, and concentration for all your chemistry calculations.",
    color: "from-emerald-500 to-green-400",
    darkColor: "dark:from-emerald-400 dark:to-green-300",
    hoverColor: "hover:from-emerald-600 hover:to-green-500",
    darkHoverColor: "dark:hover:from-emerald-500 dark:hover:to-green-400",
    iconColor: "text-emerald-400 dark:text-emerald-300",
    bgGradient: "bg-gradient-to-br from-emerald-500/10 to-green-400/10 dark:from-emerald-400/10 dark:to-green-300/10"
  },
  {
    name: "2D Lab",
    icon: <GiChemicalTank />,
    path: "/tools/2dlab", 
    description: "Visualize and simulate chemical reactions in a virtual 2D laboratory environment. Perfect for understanding molecular interactions and reaction mechanisms.",
    color: "from-purple-500 to-pink-400",
    darkColor: "dark:from-purple-400 dark:to-pink-300",
    hoverColor: "hover:from-purple-600 hover:to-pink-500",
    darkHoverColor: "dark:hover:from-purple-500 dark:hover:to-pink-400",
    iconColor: "text-purple-400 dark:text-purple-300",
    bgGradient: "bg-gradient-to-br from-purple-500/10 to-pink-400/10 dark:from-purple-400/10 dark:to-pink-300/10"
  }
];

export default async function page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="font-sans min-h-screen bg-bg dark:bg-bg-dark p-8 pb-20 sm:p-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text dark:text-text-dark mb-4 font-montserrat">
            Chemistry Tools Hub
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary text-lg font-inter">
            Professional chemistry tools for students and researchers
          </p>
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
                  {item.name}
                </h2>
              </div>
              
              <p className="text-text-secondary dark:text-text-dark-secondary text-sm leading-relaxed mb-6 font-inter">
                {item.description}
              </p>
              
              <Link href={item.path}>
                <button className={`w-full bg-gradient-to-r ${item.color} ${item.darkColor} ${item.hoverColor} ${item.darkHoverColor} text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg dark:focus:ring-offset-bg-dark focus:ring-blue-500 font-montserrat`}>
                  Launch Tool
                </button>
              </Link>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}