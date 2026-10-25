'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, CheckCircle2, Mail, MapPin, Menu, Phone, ShieldCheck, Sparkles } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

export function FintechHeader() {
  const pathname = usePathname();
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  return <header className="fintech-header"><div className="fintech-container fintech-nav"><Link href="/" className="fintech-brand" aria-label="Bright Spark home"><Image src="/bright-spark-logo.jpg" alt="Bright Spark Innovations" width={190} height={58} priority /></Link><nav aria-label="Primary navigation">{links.map((item) => <Link key={item.href} href={item.href} className={isActive(item.href) ? 'fintech-nav-active' : undefined} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>)}</nav><Link href="/login" className="fintech-login">Login Now <ArrowRight size={16} /></Link><details className="fintech-mobile-menu"><summary aria-label="Open navigation"><Menu size={22} /></summary><div>{links.map((item) => <Link key={item.href} href={item.href} className={isActive(item.href) ? 'fintech-nav-active' : undefined} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>)}<Link href="/login">Login Now</Link></div></details></div></header>;
}

export function FintechFooter() {
  return <footer className="fintech-footer"><div className="fintech-container fintech-footer-grid"><div><Image src="/bright-spark-logo.jpg" alt="Bright Spark Innovations" width={176} height={54} /><p>Digital payment infrastructure designed to help businesses serve customers, manage money movement, and operate with clarity.</p></div><div><h3>Company</h3>{links.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div><div><h3>Platform</h3><Link href="/services#assisted-payments">Assisted Payments</Link><Link href="/services#money-movement">Money Movement</Link><Link href="/services#operations">Operations</Link></div><div><h3>Connect</h3><a href="mailto:brightsparkinnovation2026@gmail.com"><Mail size={15} /> brightsparkinnovation2026@gmail.com</a><a href="mailto:info@brightsparkinnovation.com"><Mail size={15} /> info@brightsparkinnovation.com</a><a href="tel:+919652283222"><Phone size={15} /> +91 96522 83222</a><span><MapPin size={15} /> Door No: 12-8-42, 2nd Floor, Savithri Mallaiah Arcade, Lallaguda, Secunderabad, Hyderabad, Telangana-500017</span></div></div><div className="fintech-container fintech-footer-bottom"><span>© 2026 Bright Spark Innovations Pvt. Ltd.</span><span><ShieldCheck size={15} /> Built for responsible digital payment operations</span></div></footer>;
}

export function FintechPage({ children }: { children: React.ReactNode }) {
  return <div className="fintech-site"><FintechHeader /><main>{children}</main><FintechFooter /></div>;
}

export function PageHero({ eyebrow, title, description, highlights }: { eyebrow: string; title: string; description: string; highlights: string[] }) {
  return <section className="fintech-page-hero"><div className="fintech-page-glow" /><div className="fintech-container fintech-page-hero-grid"><div><span className="fintech-eyebrow"><Sparkles size={14} /> {eyebrow}</span><h1>{title}</h1><p>{description}</p><div className="fintech-page-hero-actions"><Link href="/login" className="fintech-primary">Login Now <ArrowRight size={16} /></Link><Link href="/contact" className="fintech-hero-text-link">Talk to our team <ArrowRight size={15} /></Link></div></div><div className="fintech-page-hero-card"><span>BRIGHT SPARK</span><h2>{eyebrow}</h2><p>Connected capabilities for modern financial operations.</p><div>{highlights.map((item, index) => <article key={item}><b>0{index + 1}</b><span>{item}</span><CheckCircle2 /></article>)}</div></div></div></section>;
}
