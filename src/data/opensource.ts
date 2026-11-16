export type Contribution = {
  id: string;
  title: string;
  description: string;
  link: string;
  status: "Merged" | "Open" | "Closed";
  date: string;
};

export type OpenSourceProject = {
  name: string;
  slug: string;
  logoLight: string;
  logoDark: string;
  link: string;
  description: string;
  prs: Contribution[];
  issues: Contribution[];
};

export const openSourceProjects: OpenSourceProject[] = [
  {
    name: "GM Hyprland",
    slug: "gmhyprland",
    logoLight: "/images/opensource/hyprland.png",
    logoDark: "/images/opensource/hyprland.png",
    link: "https://github.com/voidd-sam/lace-hyprland",
    description: "A full hyprland setup",
    prs: [
      {
        id: "11734",
        title: "add: added many new config",
        description:
          "Build a full hyprland working from scratch. Ready to install one click",
        link: "https://github.com/voidd-sam/lace-hyprland",
        status: "Open",
        date: "Jul 2026",
      },
    ],
    issues: [
      {
        id: "11731",
        title: "Added pywal16 support ",
        description: "Now supports pywal16 all across desktop",
        link: "https://github.com/voidd-sam/lace-hyprland",
        status: "Open",
        date: "Jul 2026",
      },
      {
        id: "11730",
        title: "Liquid glass waybar",
        description: "added new waybar style",
        link: "https://github.com/voidd-sam/lace-hyprland",
        status: "Open",
        date: "Jul 2026",
      },
    ],
  },
];
