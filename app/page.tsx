import { PortfolioLayout } from '@/components/portfolio/portfolio-layout';
import { HeroImage } from '@/components/portfolio/hero-image';
import { About } from '@/components/portfolio/about';
import { Blog } from '@/components/portfolio/blog';
import { Lab } from '@/components/portfolio/lab';
import { Experience } from '@/components/portfolio/experience';
import { Projects } from '@/components/portfolio/projects';
import { Contact } from '@/components/portfolio/contact';
import { getProfileConfigs, getExperiences, getProjects, getLabApps, blogClient } from '@/lib/cms';

export default async function Home() {
  const [profile, experiences, projects, labApps, posts] = await Promise.all([
    getProfileConfigs(),
    getExperiences(),
    getProjects(),
    getLabApps(),
    blogClient.getAllPosts().catch(() => []).then((p: any[]) =>
      [...p].sort((a, b) =>
        new Date(b.publishedAt || b.date || b.createdAt || 0).getTime() -
        new Date(a.publishedAt || a.date || a.createdAt || 0).getTime()
      )
    ),
  ]);

  return (
    <PortfolioLayout>
      <HeroImage />
      <About profile={profile} />
      <Blog posts={posts} />
      <Lab apps={labApps} />
      <Experience experiences={experiences} />
      <Projects projects={projects} />
      <Contact email={profile?.email} socials={profile?.socials} />
    </PortfolioLayout>
  );
}
