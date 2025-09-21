import Link from "next/link";
import AuthButton from "./AuthButton"; 

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    main: [
      { label: "Home", href: "/" },
      { label: "Courses", href: "/Courses" },
      { label: "Tools", href: "/tools" },
      { label: "Honor Page", href: "/Honor" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
    social: [
      { label: "GitHub", href: "https://github.com/hassool", external: true },
      { label: "LinkedIn", href: "https://linkedin.com/in/hassool", external: true },
      { label: "Twitter", href: "https://twitter.com/hassool", external: true },
    ]
  };

  return (
    <footer className="relative bg-gradient-to-br from-bg via-bg-secondary to-bg dark:from-bg-dark dark:via-bg-dark-secondary dark:to-bg-dark border-t border-border/50 dark:border-border-dark/50">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgb(0,0,0)_1px,_transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      <div className="relative container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-bg-secondary/80 to-bg/80 dark:from-bg-dark-secondary/80 dark:to-bg-dark/80 backdrop-blur-sm border border-border/30 dark:border-border-dark/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-special/20">
              <div className="mb-4">
                <h2 className="text-2xl font-montserrat font-bold text-text dark:text-text-dark mb-2">
                  <span className="bg-gradient-to-r from-special via-[#dda76f] to-[#8a007d] bg-clip-text text-transparent">
                    BENZENE
                  </span>
                </h2>
                <div className="w-12 h-1 bg-gradient-to-r from-special to-[#dda76f] rounded-full"></div>
              </div>
              <p className="text-text-secondary dark:text-text-dark-secondary mb-6 leading-relaxed">
                Empowering learners with cutting-edge courses and tools. Built with passion and innovation.
              </p>
              <AuthButton />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            {/* Main Links */}
            <div>
              <h3 className="text-lg font-montserrat font-semibold text-text dark:text-text-dark mb-6 relative">
                Navigation
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-special rounded-full"></div>
              </h3>
              <nav className="space-y-3">
                {footerLinks.main.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group flex items-center text-text-secondary dark:text-text-dark-secondary hover:text-special transition-all duration-300 hover:translate-x-1"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-special rounded-full transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal & Social */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-montserrat font-semibold text-text dark:text-text-dark mb-6 relative">
                  Legal
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-special rounded-full"></div>
                </h3>
                <nav className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="group flex items-center text-text-secondary dark:text-text-dark-secondary hover:text-special transition-all duration-300 hover:translate-x-1"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-special rounded-full transition-all duration-300 mr-0 group-hover:mr-2"></span>
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div>
                <h3 className="text-lg font-montserrat font-semibold text-text dark:text-text-dark mb-6 relative">
                  Connect
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-special rounded-full"></div>
                </h3>
                <div className="flex space-x-4">
                  {footerLinks.social.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="group w-10 h-10 bg-bg-secondary dark:bg-bg-dark-secondary border border-border/50 dark:border-border-dark/50 rounded-xl flex items-center justify-center hover:bg-special hover:border-special hover:scale-110 transition-all duration-300 hover:shadow-lg"
                      title={link.label}
                    >
                      <span className="text-text-secondary dark:text-text-dark-secondary group-hover:text-white text-sm font-semibold">
                        {link.label[0]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Created By Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-special/5 to-[#dda76f]/5 dark:from-special/10 dark:to-[#dda76f]/10 border border-special/20 rounded-2xl p-6 hover:border-special/30 transition-all duration-500">
              <h3 className="text-lg font-montserrat font-semibold text-text dark:text-text-dark mb-3">
                Created By
              </h3>
              <div className="mb-4">
                <span className="text-2xl font-bold">
                  <span className="text-[#dda76f]">H</span>
                  <span className="text-[#8a007d]">assool</span>
                </span>
              </div>
              <p className="text-text-secondary dark:text-text-dark-secondary mb-6 text-sm leading-relaxed">
                Crafted with ❤️ and countless cups of tea 🍵. Always pushing boundaries in web development.
              </p>
              <Link
                href="https://hassool.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center space-x-2 bg-gradient-to-r from-[#dda76f] to-[#8a007d] hover:from-[#8a007d] hover:to-[#dda76f] text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <span>Visit Portfolio</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-border/30 dark:border-border-dark/30 bg-gradient-to-r from-bg-secondary/50 via-bg/50 to-bg-secondary/50 dark:from-bg-dark-secondary/50 dark:via-bg-dark/50 dark:to-bg-dark-secondary/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                © {currentYear} BENZENE. All rights reserved.
              </p>
              <div className="hidden md:block w-1 h-1 bg-text-secondary/50 rounded-full"></div>
              <p className="hidden md:block text-sm text-text-secondary dark:text-text-dark-secondary">
                Made with Next.js & Tailwind CSS
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs text-text-secondary dark:text-text-dark-secondary">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}