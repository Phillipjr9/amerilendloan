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

const customerReviews = [
  { name: "Sarah M.", location: "Austin, TX", rating: 5, text: "Needed funds for car repairs and got approved same day. Smooth process." },
  { name: "James T.", location: "Phoenix, AZ", rating: 5, text: "Clear terms, fast approval, helpful team." },
  { name: "Maria G.", location: "Miami, FL", rating: 5, text: "They worked with my credit situation. Felt like they actually wanted to help." },
  { name: "David R.", location: "Seattle, WA", rating: 5, text: "Medical bills covered without the runaround." },
  { name: "Jennifer L.", location: "Chicago, IL", rating: 5, text: "Managing payments from my phone is convenient." },
  { name: "Michael P.", location: "Dallas, TX", rating: 5, text: "Good rates and payment flexibility." },
  { name: "Lisa K.", location: "Atlanta, GA", rating: 5, text: "Support team answered everything I asked." },
  { name: "Robert H.", location: "Denver, CO", rating: 5, text: "Straightforward with no surprises." },
  { name: "Amanda S.", location: "Portland, OR", rating: 5, text: "Approved with okay credit. Patient staff." },
  { name: "Christopher B.", location: "Boston, MA", rating: 5, text: "Quick process, reasonable rates." },
  { name: "Patricia D.", location: "Las Vegas, NV", rating: 5, text: "Applied in 10 min, funded next day." },
  { name: "Daniel W.", location: "San Diego, CA", rating: 5, text: "Consolidated debt and lowered monthly payments." },
  { name: "Jessica F.", location: "Nashville, TN", rating: 5, text: "Loan officer explained things clearly." },
  { name: "Thomas A.", location: "Charlotte, NC", rating: 5, text: "Urgent need, quick delivery." },
  { name: "Michelle C.", location: "Minneapolis, MN", rating: 5, text: "Minimal paperwork, no delays." },
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
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header/Navigation - Clean & Professional */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/">
              <a className="flex items-center flex-shrink-0">
                <img
                  src="/logo.jpg"
                  alt="AmeriLend Logo - Online Loans and Financial Services"
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                />
              </a>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
              <Link href="/prequalify">
                <a className="text-sm text-slate-600 hover:text-[#0A2540] font-medium link-underline transition-colors">Pre-Qualify</a>
              </Link>
              <Link href="/apply">
                <a className="text-sm text-slate-600 hover:text-[#0A2540] font-medium link-underline transition-colors">{t('home.nav.loans')}</a>
              </Link>
              <a href="#about" className="text-sm text-slate-600 hover:text-[#0A2540] font-medium link-underline transition-colors">{t('home.nav.about')}</a>
              <a href="#faq" className="text-sm text-slate-600 hover:text-[#0A2540] font-medium link-underline transition-colors">{t('home.nav.help')}</a>
              <a href="tel:+19452121609" className="text-sm text-slate-600 hover:text-[#0A2540] font-medium flex items-center gap-2 transition-colors">
                <Phone className="w-4 h-4" />
                (945) 212-1609
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/apply">
                    <Button className="btn-gold btn-premium px-5 py-2.5 text-sm rounded-lg">
                      {t('home.hero.applyNow')}
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540] hover:text-white px-5 py-2.5 text-sm rounded-lg font-medium transition-all">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/apply">
                    <Button className="btn-gold btn-premium px-5 py-2.5 text-sm rounded-lg">
                      {t('home.hero.applyNow')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540] hover:text-white px-5 py-2.5 text-sm rounded-lg font-medium transition-all"
                    asChild
                  >
                    <a href="/login">{t('home.nav.login')}</a>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t mt-4 animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-4">
                <Link href="/prequalify">
                  <a className="text-slate-700 hover:text-[#0A2540] font-medium py-2">Pre-Qualify</a>
                </Link>
                <Link href="/apply">
                  <a className="text-slate-700 hover:text-[#0A2540] font-medium py-2">{t('home.nav.loans')}</a>
                </Link>
                <a href="#about" className="text-slate-700 hover:text-[#0A2540] font-medium py-2">
                  {t('home.nav.about')}
                </a>
                <a href="#faq" className="text-slate-700 hover:text-[#0A2540] font-medium py-2">
                  {t('home.nav.help')}
                </a>
                <a href="tel:+19452121609" className="text-slate-700 hover:text-[#0A2540] font-medium flex items-center gap-2 py-2">
                  <Phone className="w-4 h-4" />
                  (945) 212-1609
                </a>
                <div className="border-t pt-4 mt-2 flex flex-col gap-3">
                  <Link href="/apply">
                    <Button className="btn-gold btn-premium w-full py-3 rounded-lg font-semibold">
                      Apply Now
                    </Button>
                  </Link>
                  {isAuthenticated ? (
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full border-[#0A2540] text-[#0A2540] py-3 rounded-lg font-medium">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-[#0A2540] text-[#0A2540] py-3 rounded-lg font-medium"
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

      {/* Hero Section - Premium Financial Design */}
      <section className="relative bg-gradient-hero py-16 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        
        {/* Background Video with refined overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            poster="/hero-background.jpg"
            aria-hidden="true"
          >
            <source src="/hero-background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/40 via-[#0A2540]/35 to-[#0A2540]/50"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Shield className="w-4 h-4 text-[#C9A227]" />
              <span className="text-sm text-white/90 font-medium">Trusted by 50,000+ Americans</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              {t('home.hero.title')}
              <span className="block text-[#C9A227]">{t('home.hero.titleLine2')}</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Get the funds you need with competitive rates and a simple online process. 
              Same-day funding available.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
              <Link href="/apply">
                <Button 
                  size="lg" 
                  className="btn-gold btn-premium px-10 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
                >
                  {t('home.hero.applyNow')}
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white hover:text-[#0A2540] px-10 py-6 text-lg rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
                asChild
              >
                <a href="#about">Learn More</a>
              </Button>
            </div>

            {/* Key benefits */}
            <div className="flex flex-wrap justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C9A227]" />
                <span className="text-sm font-medium">Same-day funding<sup className="text-xs">1</sup></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C9A227]" />
                <span className="text-sm font-medium">No credit impact to apply<sup className="text-xs">2</sup></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C9A227]" />
                <span className="text-sm font-medium">Transparent pricing</span>
              </div>
            </div>
            
            <p className="text-sm text-white/60 mt-8">
              {t('home.hero.receivedCode')}{" "}
              <button
                onClick={() => setShowCodeModal(true)}
                className="text-[#C9A227] hover:text-[#E8D48A] underline font-medium transition-colors"
              >
                {t('home.hero.clickHere')}
              </button>
            </p>
          </div>
        </div>
        
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V20C240 0 480 0 720 20C960 40 1200 40 1440 20V60H0Z" fill="#FAFBFC"/>
          </svg>
        </div>
      </section>

      {/* Live Statistics Section - Refined */}
      <section className="bg-white py-12 md:py-16 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-1 stat-number">$250M+</div>
              <div className="text-sm text-slate-500 font-medium">{t('home.stats.loansFunded')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-1 stat-number">50K+</div>
              <div className="text-sm text-slate-500 font-medium">{t('home.stats.happyCustomers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-1 flex items-center justify-center gap-1">
                4.8 <Star className="w-6 h-6 text-[#C9A227] fill-[#C9A227]" />
              </div>
              <div className="text-sm text-slate-500 font-medium">{t('home.stats.avgRating')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-1">24/7</div>
              <div className="text-sm text-slate-500 font-medium">{t('home.stats.supportAvailable')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Qualify CTA Banner */}
      <section className="bg-gradient-to-r from-[#C9A227] to-[#E8D48A] py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-[#0A2540] mb-2">
                Not Sure If You Qualify?
              </h3>
              <p className="text-[#0A2540]/80 text-lg">
                Check your eligibility in 2 minutes — no credit impact!
              </p>
            </div>
            <Link href="/prequalify">
              <Button size="lg" className="bg-[#0A2540] hover:bg-[#0A2540]/90 text-white px-10 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all whitespace-nowrap">
                Pre-Qualify Now →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section - Clean & Modern */}
      <section className="bg-[#0A2540] text-white py-16 sm:py-20 md:py-28 relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 pattern-dots opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Process Steps */}
            <div>
              <span className="inline-block text-[#C9A227] font-semibold text-sm tracking-wider uppercase mb-4">Simple Process</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t('home.process.title')}
              </h2>
              <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-lg">
                {t('home.process.description')}
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C9A227] text-[#0A2540] flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-105 transition-transform">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('home.process.step1Title')}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t('home.process.step1Desc')}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center text-xl font-bold group-hover:bg-[#C9A227] group-hover:text-[#0A2540] group-hover:border-transparent transition-all">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('home.process.step2Title')}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t('home.process.step2Desc')}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center text-xl font-bold group-hover:bg-[#C9A227] group-hover:text-[#0A2540] group-hover:border-transparent transition-all">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('home.process.step3Title')}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t('home.process.step3Desc')}<sup>1</sup>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/apply">
                  <Button className="btn-gold btn-premium px-8 py-4 text-base rounded-xl">
                    {t('home.hero.applyNow')}
                  </Button>
                </Link>
                <Link href="/prequalify">
                  <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white hover:text-[#0A2540] px-8 py-4 text-base rounded-xl transition-all">
                    Pre-Qualify First
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/50 mt-4">
                {t('home.hero.noFicoImpact')}<sup>2</sup>
              </p>
            </div>

            {/* Application Preview Card */}
            <div className="relative lg:pl-8">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-[#C9A227]/20 rounded-3xl blur-2xl"></div>
                
                <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0A2540] mb-4">
                      <FileText className="w-8 h-8 text-[#C9A227]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A2540] mb-2">{t('home.process.loanApplication')}</h3>
                    <p className="text-sm text-slate-500">{t('home.process.quickEasyProcess')}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{t('home.process.personalInfo')}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{t('home.process.employmentDetails')}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-400">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{t('home.process.reviewSubmit')}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl opacity-50">
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-400">{t('home.process.funding')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{t('home.process.approvalTime')}</span>
                      <span className="font-bold text-[#0A2540] text-lg">{t('home.process.minutes')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Requirements Card */}
      <section className="bg-[#FAFBFC] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 sm:p-10 md:p-12 shadow-lg border border-slate-200/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#0A2540] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#C9A227]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0A2540]">
                  {t('home.eligibility.title')}
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm md:text-base text-slate-700">{t('home.eligibility.age18')}</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm md:text-base text-slate-700">{t('home.eligibility.resideUS')}</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm md:text-base text-slate-700">{t('home.eligibility.regularIncome')}</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-sm md:text-base text-slate-700">{t('home.eligibility.bankAccount')}</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors sm:col-span-2 sm:max-w-md sm:mx-auto">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-sm md:text-base text-slate-700">{t('home.eligibility.directDeposit')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Types Section - Premium Cards */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-[#C9A227] font-semibold text-sm tracking-wider uppercase mb-3">Our Products</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A2540] mb-4">
              {t('home.loanTypes.title')}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed">
              {t('home.loanTypes.subtitle')}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-[#0A2540]/5 rounded-full px-5 py-2.5 border border-[#0A2540]/10">
              <CreditCard className="w-4 h-4 text-[#0A2540]" />
              <p className="text-sm text-[#0A2540] font-medium">
                {t('home.loanTypes.processingFee')}
              </p>
            </div>
          </div>

          <div className="flex overflow-x-auto scroll-smooth gap-5 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4">
            {/* Personal Loan */}
            <Card className="card-premium flex-shrink-0 w-[280px] overflow-hidden group">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-105 transition-all">
                      <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{t('home.loanTypes.personal.tag')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A2540] mb-2">{t('home.loanTypes.personal.title')}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-grow leading-relaxed">{t('home.loanTypes.personal.desc')}</p>
                  <div className="flex gap-2 text-xs text-slate-500 mb-5">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">$1K-$50K</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">12-60mo</span>
                  </div>
                  <Link href="/apply?type=personal">
                    <Button className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white py-2.5 text-sm font-medium rounded-lg transition-all">{t('home.hero.applyNow')}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Debt Consolidation */}
            <Card className="card-premium flex-shrink-0 w-[280px] overflow-hidden group">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 group-hover:scale-105 transition-all">
                      <TrendingUp className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">{t('home.loanTypes.debtConsolidation.tag')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A2540] mb-2">{t('home.loanTypes.debtConsolidation.title')}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-grow leading-relaxed">{t('home.loanTypes.debtConsolidation.desc')}</p>
                  <div className="flex gap-2 text-xs text-slate-500 mb-5">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">$2K-$100K</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">24-84mo</span>
                  </div>
                  <Link href="/apply?type=debt-consolidation">
                    <Button className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white py-2.5 text-sm font-medium rounded-lg transition-all">{t('home.hero.applyNow')}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Medical Loan */}
            <Card className="card-premium flex-shrink-0 w-[280px] overflow-hidden group">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-500 group-hover:scale-105 transition-all">
                      <svg className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">{t('home.loanTypes.medical.tag')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A2540] mb-2">{t('home.loanTypes.medical.title')}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-grow leading-relaxed">{t('home.loanTypes.medical.desc')}</p>
                  <div className="flex gap-2 text-xs text-slate-500 mb-5">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">$500-$50K</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">12-72mo</span>
                  </div>
                  <Link href="/apply?type=medical">
                    <Button className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white py-2.5 text-sm font-medium rounded-lg transition-all">{t('home.hero.applyNow')}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Home Improvement */}
            <Card className="card-premium flex-shrink-0 w-[280px] overflow-hidden group">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:scale-105 transition-all">
                      <svg className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{t('home.loanTypes.homeImprovement.tag')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A2540] mb-2">{t('home.loanTypes.homeImprovement.title')}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-grow leading-relaxed">{t('home.loanTypes.homeImprovement.desc')}</p>
                  <div className="flex gap-2 text-xs text-slate-500 mb-5">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">$3K-$100K</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">24-120mo</span>
                  </div>
                  <Link href="/apply?type=home-improvement">
                    <Button className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white py-2.5 text-sm font-medium rounded-lg transition-all">{t('home.hero.applyNow')}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Auto Loan */}
            <Card className="card-premium flex-shrink-0 w-[280px] overflow-hidden group">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-105 transition-all">
                      <svg className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{t('home.loanTypes.auto.tag')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A2540] mb-2">{t('home.loanTypes.auto.title')}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-grow leading-relaxed">{t('home.loanTypes.auto.desc')}</p>
                  <div className="flex gap-2 text-xs text-slate-500 mb-5">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">$5K-$75K</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">24-84mo</span>
                  </div>
                  <Link href="/apply?type=auto">
                    <Button className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white py-2.5 text-sm font-medium rounded-lg transition-all">{t('home.hero.applyNow')}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Business Loan */}
            <Card className="card-premium flex-shrink-0 w-[280px] overflow-hidden group">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-500 group-hover:scale-105 transition-all">
                      <svg className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{t('home.loanTypes.business.tag')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A2540] mb-2">{t('home.loanTypes.business.title')}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-grow leading-relaxed">{t('home.loanTypes.business.desc')}</p>
                  <div className="flex gap-2 text-xs text-slate-500 mb-5">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">$10K-$500K</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">12-120mo</span>
                  </div>
                  <Link href="/apply?type=business">
                    <Button className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white py-2.5 text-sm font-medium rounded-lg transition-all">{t('home.hero.applyNow')}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Loan */}
            <Card className="card-premium flex-shrink-0 w-[280px] overflow-hidden group">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-105 transition-all">
                      <Clock className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">{t('home.loanTypes.emergency.tag')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A2540] mb-2">{t('home.loanTypes.emergency.title')}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-grow leading-relaxed">{t('home.loanTypes.emergency.desc')}</p>
                  <div className="flex gap-2 text-xs text-slate-500 mb-5">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">$500-$10K</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">6-36mo</span>
                  </div>
                  <Link href="/apply?type=emergency">
                    <Button className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white py-2.5 text-sm font-medium rounded-lg transition-all">{t('home.hero.applyNow')}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Wedding Loan */}
            <Card className="card-premium flex-shrink-0 w-[280px] overflow-hidden group">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-pink-500 to-pink-600"></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center group-hover:bg-pink-500 group-hover:scale-105 transition-all">
                      <svg className="w-6 h-6 text-pink-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">{t('home.loanTypes.wedding.tag')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A2540] mb-2">{t('home.loanTypes.wedding.title')}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-grow leading-relaxed">{t('home.loanTypes.wedding.desc')}</p>
                  <div className="flex gap-2 text-xs text-slate-500 mb-5">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">$2K-$50K</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">12-60mo</span>
                  </div>
                  <Link href="/apply?type=wedding">
                    <Button className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white py-2.5 text-sm font-medium rounded-lg transition-all">{t('home.hero.applyNow')}</Button>
                  </Link>
                </div>
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
                  <span className="text-xs font-semibold text-cyan-600 bg-cyan-100 px-2 py-1 rounded">{t('home.loanTypes.vacation.tag')}</span>
                </div>
                <h3 className="text-base font-bold text-[#0A2540] mb-2">{t('home.loanTypes.vacation.title')}</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">{t('home.loanTypes.vacation.desc')}</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$1K-$25K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">12-48mo</span>
                </div>
                <Link href="/apply?type=vacation">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 focus:outline-none">{t('home.hero.applyNow')}</Button>
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
                  <span className="text-xs font-semibold text-teal-600 bg-teal-100 px-2 py-1 rounded">{t('home.loanTypes.studentRefinance.tag')}</span>
                </div>
                <h3 className="text-base font-bold text-[#0A2540] mb-2">{t('home.loanTypes.studentRefinance.title')}</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">{t('home.loanTypes.studentRefinance.desc')}</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$5K-$150K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">60-240mo</span>
                </div>
                <Link href="/apply?type=student-refinance">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 focus:outline-none">{t('home.hero.applyNow')}</Button>
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
                  <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2 py-1 rounded">{t('home.loanTypes.moving.tag')}</span>
                </div>
                <h3 className="text-base font-bold text-[#0A2540] mb-2">{t('home.loanTypes.moving.title')}</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">{t('home.loanTypes.moving.desc')}</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$1K-$20K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">12-48mo</span>
                </div>
                <Link href="/apply?type=moving">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-rose-600 focus:outline-none">{t('home.hero.applyNow')}</Button>
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
                  <span className="text-xs font-semibold text-lime-600 bg-lime-100 px-2 py-1 rounded">{t('home.loanTypes.greenEnergy.tag')}</span>
                </div>
                <h3 className="text-base font-bold text-[#0A2540] mb-2">{t('home.loanTypes.greenEnergy.title')}</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">{t('home.loanTypes.greenEnergy.desc')}</p>
                <div className="flex gap-2 text-xs text-gray-600 mb-4 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">$5K-$100K</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">36-240mo</span>
                </div>
                <Link href="/apply?type=green-energy">
                  <Button className="w-full bg-lime-600 hover:bg-lime-700 text-white py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-lime-600 focus:outline-none">{t('home.hero.applyNow')}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why AmeriLend Section - OppLoans Style */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A2540] text-center mb-4">
            {t('home.whyAmeriLend.title')}
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {t('home.whyAmeriLend.subtitle')}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Easy to Apply */}
            <Card className="border-t-4 border-t-[#C9A227] hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-[#C9A227]/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-[#C9A227]" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.easyApply.title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.whyAmeriLend.easyApply.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Same-Day Funding */}
            <Card className="border-t-4 border-t-[#0A2540] hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-[#0A2540]/10 flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-[#0A2540]" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.sameDayFunding.title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.whyAmeriLend.sameDayFunding.desc')}<sup className="text-xs">1</sup>
                </p>
              </CardContent>
            </Card>

            {/* Loan Support */}
            <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Headphones className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.loanSupport.title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.whyAmeriLend.loanSupport.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Safe and Secure */}
            <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.safeSecure.title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.whyAmeriLend.safeSecure.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Transparent Process */}
            <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.transparent.title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.whyAmeriLend.transparent.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Build Credit History */}
            <Card className="border-t-4 border-t-teal-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.buildCredit.title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.whyAmeriLend.buildCredit.desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] text-center mb-12">
            {t('home.aboutSection.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-[#0A2540] mb-6">
                {t('home.aboutSection.subtitle')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('home.aboutSection.paragraph1')}
              </p>
              <p className="text-gray-600 mb-6">
                {t('home.aboutSection.paragraph2')}
              </p>
              <p className="text-gray-600">
                {t('home.aboutSection.paragraph3')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <h4 className="text-xl font-bold text-[#0A2540] mb-6">{t('home.aboutSection.valuesTitle')}</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>{t('home.aboutSection.values.transparency.title')}:</strong> {t('home.aboutSection.values.transparency.desc')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>{t('home.aboutSection.values.speed.title')}:</strong> {t('home.aboutSection.values.speed.desc')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>{t('home.aboutSection.values.support.title')}:</strong> {t('home.aboutSection.values.support.desc')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>{t('home.aboutSection.values.innovation.title')}:</strong> {t('home.aboutSection.values.innovation.desc')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* States We Service Section */}
      <section id="states" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] text-center mb-12">
            {t('home.states.title')}
          </h2>

          <div className="max-w-6xl mx-auto">
            <p className="text-center text-gray-600 mb-8">
              {t('home.states.subtitle')}
            </p>

            <div className="relative">
              {/* Left Scroll Button */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-[#0A2540]" />
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
                <ChevronRight className="w-6 h-6 text-[#0A2540]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] text-center mb-12">
            {t('home.careers.title')}
          </h2>

          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-gray-600 text-lg">
              {t('home.careers.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-[#0A2540] flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.careers.loanAdvocate.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('home.careers.loanAdvocate.desc')}
                </p>
                <Button asChild className="border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540] hover:text-white" variant="outline">
                  <a href="/careers" className="no-underline">
                    {t('common.learnMore')}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-[#0A2540] flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.careers.riskAnalyst.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('home.careers.riskAnalyst.desc')}
                </p>
                <Button asChild className="border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540] hover:text-white" variant="outline">
                  <a href="/careers" className="no-underline">
                    {t('common.learnMore')}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-[#0A2540] flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.careers.marketingSpecialist.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('home.careers.marketingSpecialist.desc')}
                </p>
                <Button asChild className="border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540] hover:text-white" variant="outline">
                  <a href="/careers" className="no-underline">
                    {t('common.learnMore')}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              {t('home.careers.cta')}
            </p>
            <Button asChild className="bg-[#C9A227] hover:bg-[#B8922A] text-white font-semibold px-8">
              <a href="/careers">
                {t('common.viewAll')}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section - Blue Background */}
      <section className="bg-[#0A2540] text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t('home.whyAmeriLend.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0A2540] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.easyApply.title')}</h3>
                <p className="text-gray-600">
                  {t('home.whyAmeriLend.easyApply.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Benefit 2 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0A2540] flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.sameDayFunding.title')}</h3>
                <p className="text-gray-600">
                  {t('home.whyAmeriLend.sameDayFunding.desc')}<sup>1</sup>
                </p>
              </CardContent>
            </Card>

            {/* Benefit 3 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0A2540] flex items-center justify-center">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.loanSupport.title')}</h3>
                <p className="text-gray-600">
                  {t('home.whyAmeriLend.loanSupport.desc')}
                </p>
              </CardContent>
            </Card>



            {/* Benefit 5 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0A2540] flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.transparent.title')}</h3>
                <p className="text-gray-600">
                  {t('home.whyAmeriLend.transparent.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Benefit 6 */}
            <Card className="bg-white text-gray-800 relative pt-8">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[#0A2540] flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <CardContent className="pt-8 pb-6 text-center">
                <h3 className="text-xl font-bold text-[#0A2540] mb-3">{t('home.whyAmeriLend.buildCredit.title')}</h3>
                <p className="text-gray-600">
                  {t('home.whyAmeriLend.buildCredit.desc')}<sup>6</sup>
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
            <p className="text-center text-gray-700 text-base md:text-lg mb-6 md:mb-8">{t('home.trustedBy')}</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] text-center mb-12">
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
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0A2540] transition-colors"
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
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] text-center mb-12">
            Making Personal Finance Approachable
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-12 max-w-6xl mx-auto">
            {/* Article 1 */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardContent className="p-4 md:p-6 flex flex-col items-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-[#0A2540]/10 mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-[#0A2540]/20 flex-shrink-0">
                  <img 
                    src="/images/financial-guide.jpg" 
                    alt="Financial Guide" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#0A2540] mb-2">
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
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-[#C9A227]/10 mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-[#C9A227]/20 flex-shrink-0">
                  <img 
                    src="/images/budget-tight.jpg" 
                    alt="Budget Management" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#0A2540] mb-2">
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
                <h3 className="text-lg font-bold text-[#0A2540] mb-2">
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
              <h4 className="font-semibold mb-3">{t('home.footer.contactUs')}</h4>
              <p className="text-sm text-gray-400">{t('home.footer.needHelp')}</p>
              <div className="mt-3 space-y-2 text-sm">
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('home.footer.hours')}</h4>
              <div className="text-sm text-gray-400 space-y-1">
                <p>{t('home.footer.weekdayHours')}</p>
                <p>{t('home.footer.weekendHours')}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('home.footer.quickLinks')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-white cursor-pointer">{t('common.home')}</a></li>
                <li><a href="/apply" className="hover:text-white cursor-pointer">{t('home.hero.applyNow')}</a></li>
                <li><a href="#faq" className="hover:text-white cursor-pointer">{t('common.faq')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('home.footer.company')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#about" className="hover:text-white cursor-pointer">{t('common.aboutUs')}</a></li>
                <li><a href="tel:+19452121609" className="hover:text-white cursor-pointer">{t('home.footer.contactSupport')}</a></li>
                <li><a href="mailto:support@amerilendloan.com" className="hover:text-white cursor-pointer">{t('home.footer.emailSupport')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('home.footer.resources')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#faq" className="hover:text-white cursor-pointer">{t('common.faq')}</a></li>
                <li><a href="/dashboard" className="hover:text-white cursor-pointer">{t('common.dashboard')}</a></li>
                <li><a href="mailto:support@amerilendloan.com" className="hover:text-white cursor-pointer">{t('home.footer.helpCenter')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('home.footer.legal')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/legal/privacy-policy" className="hover:text-[#C9A227] cursor-pointer transition-colors">{t('home.footer.privacyPolicy')}</a></li>
                <li><a href="/legal/terms-of-service" className="hover:text-[#C9A227] cursor-pointer transition-colors">{t('home.footer.termsOfService')}</a></li>
                <li><a href="/legal/loan-agreement" className="hover:text-[#C9A227] cursor-pointer transition-colors">{t('home.footer.loanAgreement')}</a></li>
                <li><a href="/legal/esign-consent" className="hover:text-[#C9A227] cursor-pointer transition-colors">{t('home.footer.esignConsent')}</a></li>
              </ul>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="text-center py-8 border-b border-gray-800">
            <h4 className="font-semibold mb-4">{t('home.footer.connectWithUs')}</h4>
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
              <a href="/legal/terms-of-service" className="text-[#C9A227] hover:text-orange-300 underline cursor-pointer transition-colors font-medium">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="/legal/privacy-policy" className="text-[#C9A227] hover:text-orange-300 underline cursor-pointer transition-colors font-medium">
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
              <h2 className="text-2xl font-bold text-gray-900">{t('home.modal.title')}</h2>
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setVerificationCode("");
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A2540] rounded p-1"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <p className="text-gray-600 mb-6">
              {t('home.modal.description')}
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
                  {t('home.modal.codeLabel')}
                </label>
                <input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder={t('home.modal.codePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none text-center text-lg font-semibold tracking-wider"
                  autoFocus
                  maxLength={20}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!verificationCode.trim()}
                className="w-full bg-[#0A2540] hover:bg-[#0025A0] disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2540] focus:outline-none"
              >
                {t('home.modal.verify')}
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
                {t('common.cancel')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
