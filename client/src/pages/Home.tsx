import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Headphones,
  TrendingUp,
  ChevronDown,
  Menu,
  Phone,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  X,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/_core/hooks/useAuth";
import { AISupport } from "@/components/AISupport";
import AiSupportWidget from "@/components/AiSupportWidget";
import TestimonialsSection from "@/components/TestimonialsSection";
import { trpc } from "@/lib/trpc";

// Testimonials data extracted for performance
const testimonials = [
  { name: "Sarah M.", location: "Austin, TX", rating: 5, text: "AmeriLend saved me when I needed emergency car repairs. The application was so easy and I got approved within hours!" },
  { name: "James T.", location: "Phoenix, AZ", rating: 5, text: "Best lending experience I've ever had. Transparent fees, quick approval, and amazing customer service." },
  { name: "Maria G.", location: "Miami, FL", rating: 5, text: "I was worried about my credit score, but AmeriLend worked with me. They truly care about helping people." },
  { name: "David R.", location: "Seattle, WA", rating: 5, text: "Fast, easy, and professional. Got the funds I needed for my medical bills without any hassle." },
  { name: "Jennifer L.", location: "Chicago, IL", rating: 5, text: "The mobile app makes everything so convenient. I can manage my loan payments right from my phone!" },
  { name: "Michael P.", location: "Dallas, TX", rating: 5, text: "Excellent rates and flexible payment options. AmeriLend really understands their customers' needs." },
  { name: "Lisa K.", location: "Atlanta, GA", rating: 5, text: "Customer support is top-notch. They answered all my questions and made me feel comfortable throughout the process." },
  { name: "Robert H.", location: "Denver, CO", rating: 5, text: "I've used other lenders before, but AmeriLend is by far the best. No hidden fees and very straightforward." },
  { name: "Amanda S.", location: "Portland, OR", rating: 5, text: "Got approved even with less than perfect credit. The team was understanding and helpful every step of the way." },
  { name: "Christopher B.", location: "Boston, MA", rating: 5, text: "Quick turnaround time and competitive rates. Highly recommend for anyone needing a personal loan." },
  { name: "Patricia D.", location: "Las Vegas, NV", rating: 5, text: "The online application took less than 10 minutes. Money was in my account the next business day!" },
  { name: "Daniel W.", location: "San Diego, CA", rating: 5, text: "Professional, reliable, and trustworthy. AmeriLend helped me consolidate my debt and save money." },
  { name: "Jessica F.", location: "Nashville, TN", rating: 5, text: "Great experience from start to finish. The loan officer explained everything clearly and patiently." },
  { name: "Thomas A.", location: "Charlotte, NC", rating: 5, text: "I needed funds urgently and AmeriLend delivered. Fast approval and same-day funding!" },
  { name: "Michelle C.", location: "Minneapolis, MN", rating: 5, text: "Very impressed with how smooth the process was. No unnecessary paperwork or delays." },
];


export default function Home() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const { isAuthenticated } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch user's loans to check if they have any pending fee payments
  const { data: loans } = trpc.loans.myApplications.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Check if user has any loans that need fee payment
  // Only show payment prompt for approved or fee_pending status (not fee_paid or disbursed)
  const hasLoansNeedingPayment = loans?.some(
    loan => loan.status === "approved" || loan.status === "fee_pending"
  );

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? -200 : -400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 200 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-2 sm:py-2.5 md:py-3">
          <div className="flex items-center justify-between gap-4 sm:gap-6">
            {/* Logo - Fixed sizing on mobile */}
            <Link href="/">
              <a className="flex items-center flex-shrink-0">
                <img
                  src="/logo.jpg"
                  alt="AmeriLend Logo - Online Loans and Financial Services"
                  className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                />
              </a>
            </Link>

            {/* Desktop Navigation - Hidden on Mobile */}
            <nav className="hidden md:flex items-center gap-4 flex-1">
              <Link href="/apply">
                <a className="text-sm text-gray-700 hover:text-[#0033A0] whitespace-nowrap font-medium">{t('home.nav.loans')}</a>
              </Link>
              <a href="#about" className="text-sm text-gray-700 hover:text-[#0033A0] whitespace-nowrap font-medium">{t('home.nav.about')}</a>
              <a href="#faq" className="text-sm text-gray-700 hover:text-[#0033A0] whitespace-nowrap font-medium">{t('home.nav.help')}</a>
              <a href="tel:+19452121609" className="text-sm text-gray-700 hover:text-[#0033A0] whitespace-nowrap font-medium flex items-center gap-1">
                <Phone className="w-4 h-4" />
                +1 945 212-1609
              </a>
            </nav>



            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-1.5">
              {isAuthenticated ? (
                <>
                  <Link href="/apply">
                    <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-semibold px-4 py-2 text-sm whitespace-nowrap focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500] focus:outline-none">
                      {t('home.hero.applyNow')}
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white px-4 py-2 text-sm whitespace-nowrap focus:ring-2 focus:ring-offset-2 focus:ring-[#0033A0] focus:outline-none">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/apply">
                    <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-semibold px-4 py-2 text-sm whitespace-nowrap focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500] focus:outline-none">
                      {t('home.hero.applyNow')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white px-4 py-2 text-sm whitespace-nowrap focus:ring-2 focus:ring-offset-2 focus:ring-[#0033A0] focus:outline-none"
                    asChild
                  >
                    <a href="/login">{t('home.nav.login')}</a>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t mt-3">
              <nav className="flex flex-col gap-3">
                <Link href="/apply">
                  <a className="text-gray-700 hover:text-[#0033A0] text-sm font-medium">{t('home.nav.loans')}</a>
                </Link>
                <a href="#about" className="text-gray-700 hover:text-[#0033A0] text-sm font-medium">
                  {t('home.nav.about')}
                </a>
                <a href="#faq" className="text-gray-700 hover:text-[#0033A0] text-sm font-medium">
                  {t('home.nav.help')}
                </a>
                <a href="tel:+19452121609" className="text-gray-700 hover:text-[#0033A0] text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +1 945 212-1609
                </a>
                <div className="border-t pt-3 mt-3 flex flex-col gap-2">
                  <Link href="/apply">
                    <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white w-full text-sm font-semibold py-2">
                      Apply Now
                    </Button>
                  </Link>
                  {isAuthenticated ? (
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full border-[#0033A0] text-[#0033A0] text-sm font-semibold py-2">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-[#0033A0] text-[#0033A0] text-sm font-semibold py-2"
                      asChild
                    >
                      <a href="/login">Log In</a>
                    </Button>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - OppLoans Style with Video Background */}
      <section className="relative bg-gradient-to-br from-[#0033A0] via-[#0044BB] to-[#0055CC] py-12 sm:py-20 md:py-28 lg:py-32 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            poster="/hero-background.jpg"
            aria-hidden="true"
          >
            <source src="/hero-background.mp4" type="video/mp4" />
          </video>
          {/* Video Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0033A0]/40 via-[#0044BB]/35 to-[#0055CC]/40"></div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-white rounded-full blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight">
              Online Loans
              <br />
              Designed for You
            </h1>

            <ul className="space-y-3 mb-8 sm:mb-10 text-white/95 max-w-2xl mx-auto">
              <li className="flex items-start gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span className="text-base sm:text-lg">
                  Same-day funding available.<sup className="text-sm">1</sup>
                </span>
              </li>
              <li className="flex items-start gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span className="text-base sm:text-lg">
                  Applying does NOT affect your FICO® credit score.<sup className="text-sm">2</sup>
                </span>
              </li>
              <li className="flex items-start gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span className="text-base sm:text-lg">No hidden fees.</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link href="/apply">
                <Button 
                  size="lg" 
                  className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-bold px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500] focus:outline-none"
                >
                  Apply Now
                </Button>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-white/90">
              Applying does NOT affect your FICO® credit score.<sup className="text-xs">2</sup>
            </p>
            
            <p className="text-xs sm:text-sm text-white/80 mt-4">
              Did you receive a code in the mail?{" "}
              <button
                onClick={() => setShowCodeModal(true)}
                className="text-white underline hover:text-white/80 font-medium cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-white focus:outline-none rounded px-1"
              >
                Click here
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section className="bg-[#0033A0] py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$250M+</div>
              <div className="text-sm text-white/80">Loans Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-sm text-white/80">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">4.8★</div>
              <div className="text-sm text-white/80">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-white/80">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section - Blue Background */}
      <section className="bg-[#0033A0] text-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Process Steps */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Simple Loan Application Process
              </h2>
              <p className="text-sm sm:text-base text-white/90 mb-6 sm:mb-8">
                Working with trusted financial partners, the AmeriLend platform offers personal loans designed to fit your needs. The process is simple and built around you:
              </p>

              <div className="space-y-4 sm:space-y-6">
                {/* Step 1 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#0033A0] flex items-center justify-center text-lg sm:text-xl font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">Apply Online</h3>
                    <p className="text-xs sm:text-sm text-white/90">
                      The application process is quick and easy, with decisions often made in minutes.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#0033A0] flex items-center justify-center text-lg sm:text-xl font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">Approval Process</h3>
                    <p className="text-xs sm:text-sm text-white/90">
                      We consider more than just your credit score, so even if you've been turned down by others, you may still qualify.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#0033A0] flex items-center justify-center text-lg sm:text-xl font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">Same-Day Funding Available</h3>
                    <p className="text-xs sm:text-sm text-white/90">
                      If approved, you may receive money in your account as soon as the same business day!<sup>1</sup>
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/apply">
                <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-semibold px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-base md:text-lg mt-6 sm:mt-8 w-full sm:w-auto">
                  Apply Now
                </Button>
              </Link>

              <p className="text-xs sm:text-sm text-white/80 mt-2 sm:mt-4">
                Applying does NOT affect your FICO® credit score.<sup>2</sup>
              </p>
            </div>

            {/* Mobile App Image / Loan Application Visual - Right Column */}
            <div className="relative">
              {/* Decorative circle background */}
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
                <div className="bg-white rounded-xl p-6 shadow-2xl">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-[#0033A0] mb-2">Loan Application</h3>
                    <p className="text-sm text-gray-600">Quick & Easy Process</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Personal Information</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Employment Details</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-500">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Review & Submit</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Funding</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Approval Time:</span>
                      <span className="font-bold text-[#0033A0]">Minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Requirements Card - Below Process Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-warning-50 border-l-4 border-l-[#FFA500] text-gray-800 rounded-lg p-6 sm:p-8 md:p-10 shadow-xl">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0033A0] mb-6 text-center">
                Before you get started, let's review our eligibility requirements.
              </h3>

              <ul className="space-y-3 sm:space-y-4 md:grid md:grid-cols-2 md:gap-6">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0033A0]" />
                  </div>
                  <span className="text-sm sm:text-base md:text-lg">Be at least 18 years old</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm md:text-lg">Reside in the United States</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm md:text-lg">Have a regular source of income</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-sm md:text-base">Have a checking or savings account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#0033A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm md:text-base">Receive paychecks through direct deposit</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Types Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] mb-4">
              Loan Options for Every Need
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Choose from our wide range of loan products designed to meet your specific financial needs
            </p>
            <div className="mt-4 p-4 bg-[#FFA500]/10 rounded-lg max-w-3xl mx-auto border border-[#FFA500]/30">
              <p className="text-xs sm:text-sm text-[#0033A0] font-semibold">
                Processing fee: 2-10% based on loan terms (paid upfront via credit/debit card or crypto before loan disbursement)
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Accepted: Visa, Mastercard, American Express, Bitcoin, Ethereum, USDT
              </p>
            </div>
          </div>

          <div className="flex overflow-x-auto scroll-smooth gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Personal Loan */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">Quick</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Personal Loan</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Flexible loans for any need</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$1K-$50K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">12-60mo</span>
                </div>
                <Link href="/apply?type=personal">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Debt Consolidation */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">Save</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Debt Consolidation</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Combine debts into one payment</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$2K-$100K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">24-84mo</span>
                </div>
                <Link href="/apply?type=debt-consolidation">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Medical Loan */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36c-.5-.63-1.5-.69-2.12-.12-.63.5-.69 1.49-.12 2.12l3.5 4.21c.5.63 1.5.69 2.12.12l4.25-5.13c.56-.67.48-1.66-.19-2.22-.67-.56-1.66-.48-2.22.19z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">Care</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Medical Loan</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Cover healthcare procedures</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$500-$50K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">12-72mo</span>
                </div>
                <Link href="/apply?type=medical">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Home Improvement */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">Build</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Home Improvement</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Renovate and upgrade your home</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$3K-$100K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">24-120mo</span>
                </div>
                <Link href="/apply?type=home-improvement">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Auto Loan */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">Drive</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Auto Loan</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Finance your next vehicle</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$5K-$75K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">24-84mo</span>
                </div>
                <Link href="/apply?type=auto">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-green-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Loan */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-indigo-500 bg-gradient-to-br from-indigo-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S15.33 8 14.5 8 13 8.67 13 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S8.33 8 7.5 8 6 8.67 6 9.5 6.67 11 7.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Grow</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Business Loan</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Fuel business growth</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$10K-$500K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">12-120mo</span>
                </div>
                <Link href="/apply?type=business">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Emergency Loan */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">Urgent</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Emergency Loan</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Fast cash when you need it</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$500-$10K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">6-36mo</span>
                </div>
                <Link href="/apply?type=emergency">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Wedding Loan */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-pink-500 bg-gradient-to-br from-pink-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-2 py-1 rounded">Dream</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Wedding Loan</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Make your day special</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$2K-$50K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">12-60mo</span>
                </div>
                <Link href="/apply?type=wedding">
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-pink-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Vacation Loan */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 6h-8l-1-1h-2l-1 1H4c-1.1 0-1.99.9-1.99 2L2 19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 13H4V8h16v11zm-5.04-6.71l-2.75 3.54-1.96-2.36c-.5-.63-1.5-.69-2.12-.12-.63.5-.69 1.49-.12 2.12l3.5 4.21c.5.63 1.5.69 2.12.12l4.25-5.13c.56-.67.48-1.66-.19-2.22-.67-.56-1.66-.48-2.22.19z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-cyan-600 bg-cyan-100 px-2 py-1 rounded">Escape</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Vacation Loan</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Travel without worry</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$1K-$25K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">12-48mo</span>
                </div>
                <Link href="/apply?type=vacation">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Student Loan Refinance */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-teal-500 bg-gradient-to-br from-teal-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S15.33 8 14.5 8 13 8.67 13 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S8.33 8 7.5 8 6 8.67 6 9.5 6.67 11 7.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 bg-teal-100 px-2 py-1 rounded">Learn</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Student Loan Refinance</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Lower your education debt</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$5K-$150K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">60-240mo</span>
                </div>
                <Link href="/apply?type=student-refinance">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Moving/Relocation Loan */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2 py-1 rounded">Move</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Moving/Relocation Loan</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Relocation made easy</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$1K-$20K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">12-48mo</span>
                </div>
                <Link href="/apply?type=moving">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-rose-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Green Energy Loan */}
            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-lime-500 bg-gradient-to-br from-lime-50 to-white flex-shrink-0 w-72">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-lime-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.41 1.41c1.04 1.04 1.68 2.48 1.68 4.08 0 3.09-2.51 5.6-5.6 5.6s-5.6-2.51-5.6-5.6c0-1.6.64-3.04 1.68-4.08l-1.41-1.41C2.82 5.75 2 7.6 2 9.66c0 5.02 4.08 9.1 9.1 9.1s9.1-4.08 9.1-9.1c0-2.06-.82-3.91-2.17-5.49z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-lime-600 bg-lime-100 px-2 py-1 rounded">Green</span>
                </div>
                <h3 className="text-base font-bold text-[#0033A0] mb-2">Green Energy Loan</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">Go eco-friendly</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$5K-$100K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">36-240mo</span>
                </div>
                <Link href="/apply?type=green-energy">
                  <Button className="w-full bg-lime-600 hover:bg-lime-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-lime-600 focus:outline-none">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why AmeriLend Section - OppLoans Style */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0033A0] text-center mb-4">
            Why AmeriLend Is Right For You
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We're committed to providing accessible, transparent, and customer-focused financial solutions
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Easy to Apply */}
            <Card className="border-t-4 border-t-[#FFA500] hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-[#FFA500]/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-[#FFA500]" />
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Easy to Apply</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our online application process is convenient and only requires personal and employment information for quick and easy completion.
                </p>
              </CardContent>
            </Card>

            {/* Same-Day Funding */}
            <Card className="border-t-4 border-t-[#0033A0] hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-[#0033A0]/10 flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-[#0033A0]" />
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Same-Day Funding Available</h3>
                <p className="text-gray-600 leading-relaxed">
                  If approved, you may receive money in your account as soon as the same business day!<sup className="text-xs">1</sup>
                </p>
              </CardContent>
            </Card>

            {/* Loan Support */}
            <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Headphones className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Loan Support At Every Step</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our top-rated Loan Advocates are available to provide support at every step of the application process. We succeed when you do!
                </p>
              </CardContent>
            </Card>

            {/* Safe and Secure */}
            <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Safe and Secure</h3>
                <p className="text-gray-600 leading-relaxed">
                  We are dedicated to protecting your information and communications with advanced 256-bit encryption technology.
                </p>
              </CardContent>
            </Card>

            {/* Transparent Process */}
            <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Transparent Process</h3>
                <p className="text-gray-600 leading-relaxed">
                  We supply you with an easy-to-read schedule with predictable payments and the ability to set up automatic payments.
                </p>
              </CardContent>
            </Card>

            {/* Build Credit History */}
            <Card className="border-t-4 border-t-teal-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Build Credit History</h3>
                <p className="text-gray-600 leading-relaxed">
                  We report your payment history to the three major credit bureaus, so every on-time payment you make may help boost your credit history.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-12">
            About AmeriLend
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-[#0033A0] mb-6">
                Making Personal Loans Accessible to Everyone
              </h3>
              <p className="text-gray-600 mb-6">
                AmeriLend is committed to providing fast, fair, and transparent personal loans to help you achieve your financial goals. We understand that life can be unpredictable, and we're here to support you every step of the way.
              </p>
              <p className="text-gray-600 mb-6">
                Our mission is to democratize access to credit by using innovative technology and a customer-first approach. We partner with trusted financial institutions to offer competitive rates and flexible terms that work for you.
              </p>
              <p className="text-gray-600">
                With years of experience in the financial services industry, we've helped thousands of customers secure the funding they need for emergencies, debt consolidation, home improvements, and more.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <h4 className="text-xl font-bold text-[#0033A0] mb-6">Our Values</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Transparency:</strong> Clear terms, no hidden fees</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Speed:</strong> Fast approvals and funding</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Support:</strong> Dedicated loan advocates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Innovation:</strong> Using technology for better service</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* States We Service Section */}
      <section id="states" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-12">
            States We Service
          </h2>

          <div className="max-w-6xl mx-auto">
            <p className="text-center text-gray-600 mb-8">
              AmeriLend is proud to serve customers in all 50 states across the United States.
            </p>

            <div className="relative">
              {/* Left Scroll Button */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-[#0033A0]" />
              </button>

              {/* Scrollable States Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto scroll-smooth px-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Alabama</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Alaska</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Arizona</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Arkansas</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">California</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Colorado</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Connecticut</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Delaware</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Florida</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Georgia</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Hawaii</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Idaho</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Illinois</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Indiana</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Iowa</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Kansas</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Kentucky</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Louisiana</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Maine</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Maryland</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Massachusetts</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Michigan</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Minnesota</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Mississippi</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Missouri</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Montana</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Nebraska</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Nevada</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">New Hampshire</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">New Jersey</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">New Mexico</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">New York</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">North Carolina</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">North Dakota</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Ohio</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Oklahoma</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Oregon</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Pennsylvania</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Rhode Island</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">South Carolina</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">South Dakota</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Tennessee</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Texas</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Utah</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Vermont</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Virginia</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Washington</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">West Virginia</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Wisconsin</div>
                <div className="bg-white px-6 py-3 rounded shadow-sm text-gray-700 whitespace-nowrap flex-shrink-0">Wyoming</div>
              </div>

              {/* Right Scroll Button */}
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 text-[#0033A0]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-12">
            Join Our Team
          </h2>

          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-gray-600 text-lg">
              We're always looking for talented individuals who are passionate about helping people achieve their financial goals. Join our growing team and make a difference in people's lives.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Loan Advocate</h3>
                <p className="text-gray-600 mb-4">
                  Help customers navigate their loan applications and provide exceptional support throughout the process.
                </p>
                <Button asChild className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white" variant="outline">
                  <a href="/careers" className="no-underline">
                    Learn More
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Risk Analyst</h3>
                <p className="text-gray-600 mb-4">
                  Analyze loan applications and ensure responsible lending practices while helping qualified applicants.
                </p>
                <Button asChild className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white" variant="outline">
                  <a href="/careers" className="no-underline">
                    Learn More
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Marketing Specialist</h3>
                <p className="text-gray-600 mb-4">
                  Develop strategies to reach customers and educate them about responsible borrowing options.
                </p>
                <Button asChild className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white" variant="outline">
                  <a href="/careers" className="no-underline">
                    Learn More
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Don't see a position that matches your skills? We're always interested in hearing from talented individuals.
            </p>
            <Button asChild className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-semibold px-8">
              <a href="/careers">
                View All Openings
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section - Blue Background */}
      <section className="bg-[#0033A0] text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why AmeriLend Is Right For You
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Easy to Apply</h3>
                <p className="text-gray-600">
                  Our online application process is convenient and only requires personal and employment information for quick and easy completion.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 2 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Same-Day Funding Available</h3>
                <p className="text-gray-600">
                  If approved, you may receive money in your account as soon as the same business day!<sup>1</sup>
                </p>
              </CardContent>
            </Card>

            {/* Benefit 3 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Loan Support At Every Step</h3>
                <p className="text-gray-600">
                  Our top-rated Loan Advocates are available to provide support at every step of the application process. We succeed when you do!
                </p>
              </CardContent>
            </Card>



            {/* Benefit 5 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Transparent Process</h3>
                <p className="text-gray-600">
                  We supply you with an easy-to-read schedule with predictable payments and the ability to set up automatic payments.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 6 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0033A0] flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0033A0] mb-3">Build Credit History</h3>
                <p className="text-gray-600">
                  We report your payment history to the three major credit bureaus, so every on-time payment you make may help boost your credit history.<sup>6</sup>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trusted By Section with Logos */}
        </div>
      </section>

      {/* Trusted By Section - White Background */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mt-0 pt-0">
            <p className="text-center text-gray-700 text-base md:text-lg mb-6 md:mb-8">Trusted by leading platforms</p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 lg:gap-16">
              {/* LendingTree Logo */}
              <div className="flex items-center justify-center">
                <img 
                  src="/lending-tree-logo.svg" 
                  alt="LendingTree" 
                  className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
                />
              </div>

              {/* Trustpilot Logo */}
              <div className="flex items-center justify-center">
                <img 
                  src="/trustpilot-logo.svg" 
                  alt="Trustpilot" 
                  className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
                />
              </div>

              {/* BBB Logo */}
              <div className="flex items-center justify-center">
                <img 
                  src="/images/bbb.png" 
                  alt="Better Business Bureau" 
                  className="h-10 sm:h-12 md:h-12 lg:h-14 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-12">
            {t('home.faq.title')}
          </h2>

          <div className="space-y-3">
            {[
              {
                question: "What are the eligibility requirements to apply for a loan?",
                answer:
                  "To apply, you must be at least 18 years old, reside in one of our serviced states, have a regular source of income, maintain a checking or savings account, and receive paychecks through direct deposit.",
                color: "border-l-orange-500",
              },
              {
                question: "How much money can I apply for?",
                answer:
                  "Loan amounts vary based on your state of residence, income, and creditworthiness. Typically, you can apply for loans ranging from $500 to $10,000.",
                color: "border-l-purple-500",
              },
              {
                question: "How are AmeriLend loans different?",
                answer:
                  "We consider more than just your credit score during the approval process. Our transparent fee structure, same-day funding options, and dedicated loan advocates set us apart from traditional lenders.",
                color: "border-l-teal-500",
              },
              {
                question: "What can you use a personal loan for?",
                answer:
                  "Personal loans can be used for various purposes including debt consolidation, emergency expenses, home improvements, medical bills, or unexpected costs. However, they cannot be used for illegal activities or speculative investments.",
                color: "border-l-pink-500",
              },
              {
                question: "How does repayment of a personal loan work?",
                answer:
                  "Repayment is structured with fixed installments over a predetermined period. You'll receive a clear repayment schedule showing all payment dates and amounts. We offer automatic payment options for your convenience.",
                color: "border-l-blue-500",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className={`bg-white border-l-4 ${faq.color} rounded-r-lg shadow-sm overflow-hidden transition-all duration-200`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleFaq(index);
                    }
                  }}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0033A0] transition-colors"
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-4 ${
                      openFaq === index ? "transform rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openFaq === index && (
                  <div 
                    id={`faq-answer-${index}`}
                    className="px-6 pb-4 text-gray-600 text-sm sm:text-base animate-in fade-in slide-in-from-top-2"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0033A0] text-center mb-12">
            Making Personal Finance Approachable
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-12 max-w-6xl mx-auto">
            {/* Article 1 */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardContent className="p-4 md:p-6 flex flex-col items-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-[#0033A0]/10 mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-[#0033A0]/20 flex-shrink-0">
                  <img 
                    src="/images/financial-guide.jpg" 
                    alt="Financial Guide" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#0033A0] mb-2">
                  The AmeriLend Money Guide: A Financial Management Tool
                </h3>
                <p className="text-gray-600 text-sm">
                  Pick up best practices for managing finances, from budgeting for all types of households to dealing with income challenges.
                </p>
              </CardContent>
            </Card>

            {/* Article 2 */}
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardContent className="p-4 md:p-6 flex flex-col items-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-[#FFA500]/10 mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-[#FFA500]/20 flex-shrink-0">
                  <img 
                    src="/images/budget-tight.jpg" 
                    alt="Budget Management" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#0033A0] mb-2">
                  How to Survive and Budget When Money Is Tight
                </h3>
                <p className="text-gray-600 text-sm">
                  Finding extra money to put aside isn't easy when finances are tight, but that doesn't mean you can't do it.
                </p>
              </CardContent>
            </Card>

            {/* Article 3 */}
            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardContent className="p-4 md:p-6 flex flex-col items-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-red-500/10 mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-red-500/20 flex-shrink-0">
                  <img 
                    src="/images/smart-spending.jpg" 
                    alt="Smart Spending" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#0033A0] mb-2">
                  'Should I Buy This?' A Financial Flowchart for Smart Spending
                </h3>
                <p className="text-gray-600 text-sm">
                  Are you a smart spender? These 5 questions will make you one.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          {/* Contact Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 md:gap-8 mb-12 pb-8 border-b border-gray-800">
            <div>
              <h4 className="font-semibold mb-3">Contact Us</h4>
              <p className="text-sm text-gray-400">Need help? Reach out to our team.</p>
              <div className="mt-3 space-y-2 text-sm">
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Hours</h4>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Mon-Fri: 8am - 8pm CT</p>
                <p>Sat-Sun: 9am - 5pm CT</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-white cursor-pointer">Home</a></li>
                <li><a href="/apply" className="hover:text-white cursor-pointer">Apply Now</a></li>
                <li><a href="#faq" className="hover:text-white cursor-pointer">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#about" className="hover:text-white cursor-pointer">About Us</a></li>
                <li><a href="tel:+19452121609" className="hover:text-white cursor-pointer">Contact Support</a></li>
                <li><a href="mailto:support@amerilendloan.com" className="hover:text-white cursor-pointer">Email Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#faq" className="hover:text-white cursor-pointer">FAQ</a></li>
                <li><a href="/dashboard" className="hover:text-white cursor-pointer">Dashboard</a></li>
                <li><a href="mailto:support@amerilendloan.com" className="hover:text-white cursor-pointer">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/public/legal/privacy-policy" className="hover:text-[#FFA500] cursor-pointer transition-colors">Privacy Policy</a></li>
                <li><a href="/public/legal/terms-of-service" className="hover:text-[#FFA500] cursor-pointer transition-colors">Terms of Service</a></li>
                <li><a href="/public/legal/loan-agreement" className="hover:text-[#FFA500] cursor-pointer transition-colors">Loan Agreement</a></li>
                <li><a href="/public/legal/esign-consent" className="hover:text-[#FFA500] cursor-pointer transition-colors">E-Sign Consent</a></li>
              </ul>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="text-center py-8 border-b border-gray-800">
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex justify-center gap-6">
              <a href="https://facebook.com/amerilend" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://twitter.com/amerilend" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Twitter">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="https://instagram.com/amerilend" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://linkedin.com/company/amerilend" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://wa.me/19452121609" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="WhatsApp">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a href="https://t.me/amerilendloans" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Telegram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Track Application Section - Removed ApplicationTracking unused component */}

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-xs space-y-4 max-w-4xl mx-auto">
            <p>
              © 2025 AmeriLend, LLC. All Rights Reserved. Use of AmeriLend, LLC is subject to our{" "}
              <a href="/public/legal/terms-of-service" className="text-[#FFA500] hover:text-orange-300 underline cursor-pointer transition-colors font-medium">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="/public/legal/privacy-policy" className="text-[#FFA500] hover:text-orange-300 underline cursor-pointer transition-colors font-medium">
                Privacy Policy
              </a>
              .
            </p>

            <p>
              California Consumers can opt-out of the sale of personal information by contacting us at{" "}
              <a href="mailto:support@amerilendloan.com" className="text-white hover:underline cursor-pointer">
                support@amerilendloan.com
              </a>
              {" "}or calling{" "}
              <a href="tel:+19452121609" className="text-white hover:underline">
                (945) 212-1609
              </a>
              .
            </p>

            <p>
              Applications submitted on the AmeriLend platform will be originated by one of our bank partners and serviced by AmeriLend. Please see the Rates and Terms for details regarding the availability of products in your state of residence.
            </p>

            <div className="space-y-3 text-left">
              <p>
                <sup>1</sup>Subject to credit approval and verification. Actual approved loan amount and terms are dependent on our bank partners' standard underwriting guidelines and credit policies. Funds may be deposited for delivery to your bank via ACH as soon as the same business day if verification is completed and final approval occurs before 12:00 PM CT on a business day. If approval occurs after 12:00 PM CT on a business day or on a non-business day, funds may be delivered as soon as the next business day. Availability of the funds is dependent on how quickly your bank processes the transaction.
              </p>

              <p>
                <sup>2</sup>AmeriLend's Bank Partners may use credit report information provided by Clarity Services and Experian as part of the application process to determine your creditworthiness. Neither credit inquiry will appear as a hard credit inquiry on your Experian credit report and therefore they will not affect your FICO score.
              </p>

              <p>
                <sup>5</sup>According to the Consumer Federation of America, a non-profit consumer advocacy group, payday loans range in size from $100 to $1,000, depending on state legal maximums, and carry an average annual percentage rate (APR) of 400%. The maximum APR for a loan offered through and serviced by AmeriLend is 195% and loan sizes range from $500 to $5,000. <a href="https://paydayloaninfo.org/how-payday-loans-work/" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">https://paydayloaninfo.org/how-payday-loans-work/</a>
              </p>

              <p>
                <sup>6</sup>AmeriLend and its Bank Partners report customer payment history to the three major credit bureaus. On-time payments may improve credit score.
              </p>
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-3">
              <p className="font-semibold">USA PATRIOT ACT NOTICE: IMPORTANT INFORMATION ABOUT PROCEDURES FOR OPENING A NEW ACCOUNT</p>

              <p>
                To help the government fight the funding of terrorism and money laundering activities, Federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account. What this means for you: When you open an account, we will ask for your name, address, date of birth, and other information that will allow us to identify you. We may also ask to see your driver's license or other identifying documents.
              </p>

              <p>
                If you have questions or concerns, please contact the AmeriLend Customer Support Team by phone at{" "}
                <a href="tel:+19452121609" className="text-white hover:underline">
                  (945) 212-1609
                </a>
                , Monday – Friday, 8 a.m. – 8:00 p.m. and Saturday and Sunday between 9 a.m. – 5:00 p.m. Eastern Time, or by sending an email to{" "}
                <a href="mailto:support@amerilendloan.com" className="text-white hover:underline">
                  support@amerilendloan.com
                </a>
                .
              </p>

              <p>LCR-6161</p>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Support Widget - Unauthenticated users */}
      <AiSupportWidget isAuthenticated={false} />

      {/* Code Entry Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8">
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Enter Your Code</h2>
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setVerificationCode("");
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0033A0] rounded p-1"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <p className="text-gray-600 mb-6">
              Enter the verification code you received in the mail to access your account.
            </p>

            {/* Code Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (verificationCode.trim()) {
                  // Navigate to dashboard with code parameter
                  window.location.href = `/dashboard?code=${encodeURIComponent(verificationCode)}`;
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g., ABC123)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] focus:border-transparent outline-none text-center text-lg font-semibold tracking-wider"
                  autoFocus
                  maxLength={20}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!verificationCode.trim()}
                className="w-full bg-[#0033A0] hover:bg-[#0025A0] disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#0033A0] focus:outline-none"
              >
                Verify Code
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  setShowCodeModal(false);
                  setVerificationCode("");
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 focus:outline-none"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
