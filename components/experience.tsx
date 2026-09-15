import { Activity, ArrowUpRight, BriefcaseBusiness, Database, Layers3 } from 'lucide-react';

const achievements = [
  { title: 'Forex & CFD trading platform', text: 'Built Next.js client, trading, admin, and partner portals alongside Node.js/Express microservices using Prisma, PostgreSQL, and Redis, deployed on Google Kubernetes Engine. Integrated MetaTrader 5 across the platform.' },
  { title: 'Payments that connect end to end', text: 'Built a stateless NestJS payment adapter for plug-and-play providers. Shipped SWRPay UPI deposits and redesigned crypto deposits and withdrawals with live status polling, OTP verification, and KYC gating.' },
  { title: 'A more maintainable backend', text: 'Refactored a roughly 10,000-line back-office backend into 25+ route and controller modules, reducing the bootstrap file to about 480 lines. Added Redis caching for frequent lookups and resolved a recurring production reliability issue.' },
  { title: 'Zuperior marketing website', text: 'Built the main website, collaborating closely with design to deliver a polished, production-ready interface.', href: 'https://zuperior.com', label: 'Visit website' },
  { title: 'Client portal & CRM', text: 'Built login, signup, and OTP screens, improving the authentication experience. Developed deposits, KYC, transactions, and settings, and integrated Cloudflare Turnstile across login, signup, and OTP screens.', href: 'https://dashboard.zuperior.com', label: 'Visit client portal' },
  { title: 'Real-time trading terminal', text: 'Optimized WebSocket and MetaTrader WebSocket API integrations for real-time data flow, improving trading execution efficiency by 25%.', href: 'https://trade.zuperior.com', label: 'Visit trading terminal' },
  { title: 'Analytics across the ecosystem', text: 'Set up Microsoft Clarity and Google Analytics 4 across the marketing website, CRM dashboard, partner/IB portal, and trading portal.' },
];

export default function Experience() {
  return <section id="experience" className="experience wrap section" aria-labelledby="experience-title">
    <div className="experience-heading"><p className="eyebrow">02 / EXPERIENCE</p><h2 id="experience-title">Built in production.</h2></div>
    <article className="experience-role">
      <div className="experience-summary"><div className="experience-icon"><BriefcaseBusiness size={23}/></div><p className="experience-company">Booming Bulls</p><h3>Full Stack<br/>Developer</h3><p className="experience-date"><time dateTime="2025-05">May 2025</time> to <time dateTime="2026-07">Jul 2026</time></p><p className="experience-intro">Built the platform’s client, admin, and trading products across the stack.</p><div className="experience-stack">Next.js · Node.js · NestJS · PostgreSQL · Redis · GKE · MetaTrader 5</div><div className="experience-system" aria-label="Platform architecture spanning interfaces, services, and live data"><div className="system-glow" aria-hidden="true"/><div className="system-card system-card-back"><Activity size={17}/><span>Live data</span><strong>Trading layer</strong></div><div className="system-card system-card-middle"><Database size={17}/><span>25+ modules</span><strong>Service layer</strong></div><div className="system-card system-card-front"><Layers3 size={17}/><span>04 interfaces</span><strong>Product layer</strong></div><p><i/> Systems online <span>99.9%</span></p></div><div className="experience-impact"><p>Production impact</p><div><span><strong>25%</strong>faster execution</span><span><strong>25+</strong>backend modules</span><span><strong>04</strong>product portals</span><span><strong>02</strong>analytics suites</span></div></div></div>
      <div className="experience-details">{achievements.map((item,i)=><div className="experience-item" key={item.title}><span className="experience-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><div><h4>{item.title}</h4><p>{item.text}</p>{item.href&&<a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}<ArrowUpRight size={15}/><span className="sr-only"> (opens in a new tab)</span></a>}</div></div>)}</div>
    </article>
  </section>;
}
