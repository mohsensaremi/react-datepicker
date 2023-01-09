import PropTypes from "prop-types";
import React from "react";
import { DateUtils } from "./date_utils";
import * as provider from "./date_utils_provider";

export const UtilsContext = React.createContext(provider);

export class UtilsContextProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    provider: PropTypes.object,
    utils: PropTypes.object,
  };

  render() {
    const { children, provider, utils } = this.props;
    if (React.Children.count(children) === 1) {
      return (
        <UtilsContext.Provider value={utils || DateUtils(provider)}>
          {React.Children.map(children, (child) =>
            React.cloneElement(child, {
              ref: (ref) => (this.children = ref),
            })
          )}
        </UtilsContext.Provider>
      );
    }

    throw new Error("one children allowed in UtilsContextProvider");
  }
}
