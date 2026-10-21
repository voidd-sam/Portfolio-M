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

      {/* 1. THE PINNED PROJECT & KEY FEATURES (60/40 Split) */}
      {pinnedProject && (
        <div className="group/projects flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Left side: Project Card (60%) */}
          <div className="w-full sm:w-[60%] shrink-0">
            <ProjectCard key={pinnedProject.name} {...pinnedProject} />
          </div>

          {/* Right side: Key Features Card (40%) */}
          <div className="w-full sm:w-[40%] shrink-0 flex flex-col gap-2 bg-card border border-dashed border-border/80 p-1.5 rounded-xl overflow-hidden hover:bg-muted/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-border group-hover/projects:opacity-50 hover:!opacity-100">
            <div className="px-2 mt-4">
              <div className="flex items-center gap-2 text-xl font-light tracking-tight">
                <span>Key Features</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Core capabilities of this pipeline</p>
            </div>

            <div className="w-full h-px bg-border mt-2 mb-1" />

            <div className="flex flex-col gap-4 px-2 pb-2 mt-2 flex-1 justify-center">
              {pinnedProject.keyFeatures?.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span className="text-sm font-light text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. THE SLIDING RECENT PROJECTS (Buttery Smooth) */}
      <div className="group/projects overflow-hidden">
        <div 
          className="flex gap-6 sm:gap-8 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
