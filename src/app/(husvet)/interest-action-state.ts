export type InterestActionState = {
  status: "idle" | "error" | "success";
  message: string;
  savedAt?: string;
};

export const idleInterestActionState: InterestActionState = {
  status: "idle",
  message: "",
};
