import type { ReactElement } from "react";

export type ItemRouteType = {
  key: string;
  components: ReactElement;
  layout: string;
  roles?: string[];
  children?: ItemRouteType[];
  title?: string;
  isMenu?: boolean;
};
