import { IProject } from "@/models/project";

interface DashboardResponse {
  profile: {
    avatar: string;
    username: string;
    bio: string;
    status: string;
  };

  projects: {
    active: IProject[];
    completed: IProject[];
  };
}
