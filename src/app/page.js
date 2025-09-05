// src/app/page.js
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
    hoverColor: "hover:from-blue-600 hover:to-cyan-500",
    iconColor: "text-blue-400"
  },
  {
    name: "Unit Converter",
    icon: <SiConvertio />,
    path: "/tools/converter",
    description: "Convert between different units of measurement including mass, volume, temperature, pressure, and concentration for all your chemistry calculations.",
    color: "from-emerald-500 to-green-400",
    hoverColor: "hover:from-emerald-600 hover:to-green-500",
    iconColor: "text-emerald-400"
  },
  {
    name: "2D Lab",
    icon: <GiChemicalTank />,
    path: "/tools/2dlab",
    description: "Visualize and simulate chemical reactions in a virtual 2D laboratory environment. Perfect for understanding molecular interactions and reaction mechanisms.",
    color: "from-purple-500 to-pink-400",
    hoverColor: "hover:from-purple-600 hover:to-pink-500",
    iconColor: "text-purple-400"
  }
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="font-sans min-h-screen bg-bg p-8 pb-20 sm:p-20">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Chemistry Tools Hub</h1>
          <p className="text-gray-400 text-lg">Professional chemistry tools for students and researchers</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {NavList.map((item, index) => (
            <div
              key={item.name}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-4xl ${item.iconColor} transition-all duration-200`}>
                  {item.icon}
                </div>
                <h2 className="text-xl font-semibold text-white">{item.name}</h2>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {item.description}
              </p>
              
              <Link href={item.path}>
                <button className={`w-full bg-gradient-to-r ${item.color} ${item.hoverColor} text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500`}>
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