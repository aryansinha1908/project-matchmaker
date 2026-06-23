import { IProject } from "@/models/project";

export interface DashboardResponse {
  profile: {
    avatar: string;
    username: string;
    profileReadme: string;
    status: string;
  };

  projects: {
    active: IProject[];
    completed: IProject[];
  };

  githubEvents: any[];
}
