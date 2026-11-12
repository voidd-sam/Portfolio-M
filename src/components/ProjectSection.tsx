import ProjectCard from "./ProjectCard";
import { projects } from "@/data/projects";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const ProjectSection = () => {
  // Find the pinned project
  const pinnedProject = projects.find((p) => p.pinned);
  
  // Get the other projects
  const otherProjects = projects.filter((p) => p.name !== pinnedProject?.name);
  
  // Get the 3 most recent other projects (to make 4 total)
  const recentProjects = otherProjects.slice(0, 3);
  
  // Put pinned first, then the 3 recent projects
  const displayProjects = pinnedProject ? [pinnedProject, ...recentProjects] : recentProjects.slice(0, 4);

  return (
    <section id="projects" className="w-full space-y-6">
      <div className="flex gap-3">
        <p className="text-2xl font-light tracking-tight sm:text-3xl">
          Projects
        </p>
      </div>

      {/* THE SIMPLE 4-CARD GRID */}
      <div className="group/projects grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        {displayProjects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Button asChild size="lg" className="text-base">
          <Link to="/projects">
            View all Projects ({projects.length})
            <ChevronRight strokeWidth={2.25} />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default ProjectSection;
