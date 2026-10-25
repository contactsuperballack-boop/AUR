import { getServices } from "@/lib/cms-client";
import { useCmsResource } from "@/hooks/useCmsResource";

export function useServicesList() {
  return useCmsResource(() => getServices(), []);
}
