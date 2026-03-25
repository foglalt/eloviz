export type AdminActionState = {
  status: "idle" | "error" | "success";
  message: string;
  savedAt?: string;
};

export const idleAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
};
