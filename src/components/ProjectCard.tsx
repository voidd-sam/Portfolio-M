import { LuGithub } from "react-icons/lu";
import { BiLink } from "react-icons/bi";
import TechIcon from "./helpers/TechIcon";
import type { Project } from "@/data/projects";
import { useNavigate } from "react-router-dom";
import { Pin } from "lucide-react";

const ProjectCard = ({ name, imgSrc, description, techStack, liveLink, githubLink, pinned, keyFeatures }: Project) => {
  const navigate = useNavigate();
  const slug = `/projects/${name.toLowerCase().replace(/\s+/g, "-")}`;

  // SPECIAL HORIZONTAL LAYOUT FOR PINNED PROJECTS
  if (pinned) {
    return (
      <div
        role="link"
        tabIndex={0}
        onClick={() => navigate(slug)}
        onKeyDown={(e) => e.key === "Enter" && navigate(slug)}
        className="group flex flex-col md:flex-row gap-2 bg-card border border-dashed border-border/80 p-1.5 rounded-xl w-full overflow-hidden hover:bg-muted/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-border group-hover/projects:opacity-50 hover:!opacity-100"
      >
        {/* Left Side: Image + Featured Badge */}
        <div className="relative group/image rounded-lg overflow-hidden border border-border/80 bg-muted/30 w-full md:w-[35%] shrink-0">
          <span className="absolute top-2 left-2 z-10 text-[10px] tracking-widest uppercase text-foreground/40 border border-foreground/20 px-1.5 py-0.5 rounded-sm bg-background/50 backdrop-blur-sm">
            Featured
          </span>
          <img
            src={imgSrc}
            alt={name}
            loading="lazy"
            className="rounded-lg w-full h-full object-contain transition-all duration-500 ease-out group-hover/image:blur-xs"
          />
        </div>

        {/* Right Side: Text and Links */}
        <div className="flex flex-col flex-1 px-4 py-2 justify-center">
          <div className="flex items-center gap-2 text-xl font-light tracking-tight">
            <Pin size={16} className="text-blue-500 shrink-0" />
            <span>{name}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{description}</p>

          {keyFeatures && keyFeatures.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              {keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                  <span className="text-sm font-light text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-4">
            {techStack.map((tech) => (
              <TechIcon key={tech.name} item={tech} className="w-5 h-5" showTooltip />
            ))}
          </div>

          <div className="w-full h-px bg-border mt-auto mb-1" />

          <div className="flex items-center justify-between mt-2">
            <a
              href={liveLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <BiLink className="w-4 h-4" />
              <span className="font-extralight">Live</span>
            </a>
            <a
              href={githubLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <LuGithub className="w-4 h-4" />
              <span className="font-extralight">Github</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // NORMAL VERTICAL LAYOUT FOR OTHER PROJECTS
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(slug)}
      onKeyDown={(e) => e.key === "Enter" && navigate(slug)}
      className="group flex flex-col gap-2 bg-card border border-dashed border-border/80 p-1.5 rounded-xl w-full overflow-hidden hover:bg-muted/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-border group-hover/projects:opacity-50 hover:!opacity-100"
    >
      <div className="group/image rounded-lg overflow-hidden border border-border/80 bg-muted/30">
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          className="rounded-lg w-full object-cover transition-all duration-500 ease-out group-hover/image:blur-xs"
        />
      </div>

      <div className="px-2 mt-4">
        <div className="text-xl font-light tracking-tight">{name}</div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>

      <div className="flex items-center gap-4 px-2 mt-4">
        {techStack.map((tech) => (
          <TechIcon key={tech.name} item={tech} className="w-5 h-5" showTooltip />
        ))}
      </div>

      <div className="w-full h-px bg-border mt-2 mb-1" />

      <div className="flex items-center justify-between mt-1 px-2 pb-2">
        <a
          href={liveLink}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <BiLink className="w-4 h-4" />
          <span className="font-extralight">Live</span>
        </a>
        <a
          href={githubLink}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <LuGithub className="w-4 h-4" />
          <span className="font-extralight">Github</span>
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
