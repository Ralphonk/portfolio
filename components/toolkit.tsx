import { Braces, Server, Bot, Database, Cloud, Wrench } from 'lucide-react';

const icons = [Braces, Server, Bot, Database, Cloud, Wrench];
const groups = [
  { title: 'Frontend', tools: ['JavaScript', 'TypeScript', 'React.js', 'Next.js', 'Redux', 'GSAP', 'Three.js', 'Tailwind CSS', 'shadcn/ui', 'Material UI', 'HTML5', 'CSS3', 'Framer Motion'] },
  { title: 'Backend', tools: ['Node.js', 'Express.js', 'Python', 'Socket.io', 'Prisma'] },
  { title: 'AI & APIs', tools: ['Gemini AI', 'OpenAI API'] },
  { title: 'Databases & Caching', tools: ['PostgreSQL', 'MongoDB (Local & Atlas)', 'Supabase', 'Redis'] },
  { title: 'Infrastructure & Cloud', tools: ['Docker', 'Google Kubernetes Engine (GKE)', 'AWS', 'Microsoft Azure', 'Vercel', 'Render'] },
  { title: 'Tools', tools: ['Git', 'GitHub', 'VS Code', 'Figma', 'Canva'] },
];

export default function Toolkit() {
  return <section className="stack-strip toolkit-section" aria-labelledby="toolkit-heading">
    <div className="wrap toolkit-wrap">
      <div className="toolkit-heading"><div><p className="toolkit-kicker">THE TOOLKIT</p><h2 id="toolkit-heading">Built with the right tools.</h2></div><p className="toolkit-caption">From the first pixel<br/>to the final deployment.</p></div>
      <div className="toolkit-grid">{groups.map((group,index) => {
        const Icon = icons[index];
        return <div className={'toolkit-group toolkit-category-'+index} key={group.title}>
          <div className="toolkit-card-top"><div className="toolkit-icon"><Icon size={22} strokeWidth={1.5}/></div><span className="toolkit-index">0{index+1}</span></div>
          <h3>{group.title}</h3>
          <ul>{group.tools.map(tool => <li key={tool}>{tool}</li>)}</ul>
        </div>;
      })}</div>
    </div>
  </section>;
}
