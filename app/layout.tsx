import type { Metadata } from 'next';
import './experience.css';
import './experience-visual.css';
import SmoothScroll from '@/components/smooth-scroll';
import 'lenis/dist/lenis.css';
import './globals.css';
import './personal.css';
import './enhancements.css';
import './resume.css';
import './dialog.css';
import './atmosphere.css';
import './toolkit.css';
import './project-previews.css';
export const metadata: Metadata = { title: 'Umesh Joshi | Full Stack Developer', description: 'Full stack developer building thoughtful web applications, AI tools, and interactive 3D experiences. Explore Shortlist, RoleLens, Fold Studio, and Zuperior.', openGraph: { title: 'Umesh Joshi | Full Stack Developer', description: 'Good design. Great code. Real impact.', type: 'website' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><SmoothScroll/>{children}</body></html>; }
