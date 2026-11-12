import ProjectCard from "./ProjectCard";
import { projects } from "@/data/projects";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const ProjectSection = () => {
  // 1. Find the pinned project
  const pinnedProject = projects.find((p) => p.pinned);
  
  // 2. Get the other projects
  const otherProjects = projects.filter((p) => p.name !== pinnedProject?.name);
  
  // 3. Reverse the array so the last added project is first (newest)
  const sortedOthers = [...otherProjects].reverse();
  
  // 4. Take the top 3 most recent
  const recentProjects = sortedOthers.slice(0, 3);
  
  // 5. Combine: Pinned first, then the 3 recent
  const displayProjects = pinnedProject ? [pinnedProject, ...recentProjects] : recentProjects.slice(0, 4);

  // The newest project is the first one in sortedOthers
  const newestProjectName = sortedOthers[0]?.name;

  return (
    <section id="projects" className="w-full space-y-6">
      <div className="flex gap-3">
        <p className="text-2xl font-light tracking-tight sm:text-3xl">
          Projects
        </p>
      </div>

      <div className="group/projects grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        {displayProjects.map((project) => (
          <ProjectCard 
            key={project.name} 
            {...project} 
            // Pass true if this is the newest project (and not the pinned one)
            isNew={!project.pinned && project.name === newestProjectName} 
          />
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
