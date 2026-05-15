'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { ProjectData } from '@/lib/cms';
import { ProjectReadmeSheet } from './project-readme-sheet';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

interface ProjectsProps {
  projects?: ProjectData[];
}

export function Projects({ projects }: ProjectsProps) {
  const displayProjects = (projects ?? []).slice(0, 3);

  return (
    <section
      id="projects"
      className="relative flex items-start justify-start px-6 md:px-8 lg:px-10 py-10 md:py-12 lg:py-16"
    >
      <motion.div
        className="max-w-4xl w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground whitespace-nowrap">
            <span className="text-primary">05.</span> Personal Projects
          </h2>
          <div className="hidden md:block flex-grow h-px bg-border max-w-xs" />
        </motion.div>

        <div className="space-y-12 md:space-y-14 lg:space-y-16">
          {displayProjects.map((project, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col gap-6"
            >
              {/* Content */}
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {project.title}
                </h3>

                <p className="text-secondary leading-relaxed mb-6 bg-card p-6 rounded border border-border">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs rounded bg-primary/10 text-primary border border-primary/20 font-medium font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <ProjectReadmeSheet project={project} />
                  {project.link && (
                    <Link
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent transition-colors duration-200"
                      aria-label={`View ${project.title}`}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  )}
                  {project.github && (
                    <Link
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent transition-colors duration-200"
                      aria-label={`GitHub ${project.title}`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </Link>
                  )}
                  {project.npm && (
                    <Link
                      href={project.npm}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent transition-colors duration-200"
                      aria-label={`npm ${project.title}`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M0 0v24h24V0H0zm19.2 19.2H4.8V4.8h14.4v14.4zm-2.4-2.4H12v-7.2h-2.4v7.2H7.2V7.2h9.6v9.6z" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="mt-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:text-foreground transition-colors group"
          >
            View all projects
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
