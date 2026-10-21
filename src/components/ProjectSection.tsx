import ProjectCard from "./ProjectCard";
import { projects } from "@/data/projects";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

const ProjectSection = () => {
  const pinnedProject = projects.find((p) => p.pinned) || projects[0];
  const otherProjects = projects.filter((p) => p.name !== pinnedProject.name);
  
  const [offset, setOffset] = useState(0);

  const handleNext = () => {
    setOffset((prev) => (prev + 2 >= otherProjects.length ? prev : prev + 2));
  };

  const handlePrev = () => {
    setOffset((prev) => (prev - 2 < 0 ? 0 : prev - 2));
  };

  return (
    <section id="projects" className="w-full space-y-6">
      <div className="flex gap-3">
        <p className="text-2xl font-light tracking-tight sm:text-3xl">
          Projects
        </p>
      </div>

      {/* 1. THE BIG PINNED PROJECT (Landscape) */}
      {pinnedProject && (
        <div className="w-full group/projects">
          <ProjectCard key={pinnedProject.name} {...pinnedProject} />
        </div>
      )}

      {/* 2. THE SLIDING RECENT PROJECTS (Buttery Smooth) */}
      <div className="group/projects overflow-hidden">
        <div 
          className="flex gap-6 sm:gap-8 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
          // Math fix: Slides exactly 1 step (which is 2 projects) at a time
          style={{ transform: `translateX(calc(-${offset * 100}% / 2 - ${offset * 0.75}rem))` }}
        >
          {otherProjects.map((project) => (
            <div 
              key={project.name} 
              className="w-full sm:w-[calc(50%-1rem)] shrink-0"
            >
              <ProjectCard {...project} />
            </div>
          ))}
        </div>
      </div>

      {/* 3. THE 3 CONTROL BUTTONS */}
      <div className="flex items-center justify-between pt-6">
        {/* Left Arrow */}
        <Button
          variant="secondary"
          size="icon"
          onClick={handlePrev}
          disabled={offset === 0}
          className="rounded-full border-dashed"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Center View All */}
        <Button asChild size="lg" className="text-base">
          <Link to="/projects">
            View all Projects ({projects.length})
            <ChevronRight strokeWidth={2.25} />
          </Link>
        </Button>

        {/* Right Arrow */}
        <Button
          variant="secondary"
          size="icon"
          onClick={handleNext}
          disabled={offset + 2 >= otherProjects.length}
          className="rounded-full border-dashed"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default ProjectSection;
