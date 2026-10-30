export type DeviceProfile = {
  id?: string;
  label: string;
  platform: string;
  os_version: string;
  device_model: string;
  app_version: string | null;
};

export type Environment = { platform?: string; osVersion?: string; device?: string; appVersion?: string };

export type Draft = {
  title: string;
  body: string;
  labels: string[];
  screenNames: string[];
  missingFields: string[];
  environment: Environment;
};

export type IssueCandidate = {
  number: number;
  title: string;
  state: "open" | "closed";
  url: string;
  authorLogin: string;
  body: string;
};

export type DuplicateMatch = Omit<IssueCandidate, "body"> & { reason: string };
