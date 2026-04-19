import { PortfolioLayout } from '@/components/portfolio/portfolio-layout';
import { HeroImage } from '@/components/portfolio/hero-image';
import { About } from '@/components/portfolio/about';
import { Experience } from '@/components/portfolio/experience';
import { Projects } from '@/components/portfolio/projects';
import { Blog } from '@/components/portfolio/blog';
import { Contact } from '@/components/portfolio/contact';
import { getProfileConfigs, getExperiences, getProjects, blogClient } from '@/lib/cms';

export default async function Home() {
  const [profile, experiences, projects, posts] = await Promise.all([
    getProfileConfigs(),
    getExperiences(),
    getProjects(),
    blogClient.getAllPosts().catch(() => []), // fallback to empty array if posts or index are missing
  ]);

  return (
    <PortfolioLayout>
      <HeroImage />
      <About profile={profile} />
      <Experience experiences={experiences} />
      <Projects projects={projects} />
      <Blog posts={posts} />
      <Contact email={profile?.email} socials={profile?.socials} />
    </PortfolioLayout>
  );
}
