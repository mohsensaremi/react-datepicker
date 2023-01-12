/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "@karnaval-org/react-datepicker" {
  import { ComponentType, ReactNode } from "react";
  export { default } from "react-datepicker";
  export * from "react-datepicker";

  export interface UtilsContextProviderProps {
    children: ReactNode;
    utils?: object;
    provider?: object;
  }

  export const UtilsContextProvider: ComponentType<UtilsContextProviderProps>;
  export const DateUtils: (utils: object) => object;
}

declare module "@karnaval-org/react-datepicker/provider/date-fns" {
  const content: object;
  export default content;
}

declare module "@karnaval-org/react-datepicker/provider/date-fns-jalali" {
  const content: object;
  export default content;
}
