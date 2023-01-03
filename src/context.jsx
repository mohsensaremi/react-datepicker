import PropTypes from "prop-types";
import React from "react";
import { DateUtils } from "./date_utils";
import * as provider from "./date_utils_provider";

export const UtilsContext = React.createContext(provider);

export class UtilsContextProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    provider: PropTypes.object,
  };

  render() {
    const { children, provider } = this.props;

    return (
      <UtilsContext.Provider value={DateUtils(provider)}>
        {children}
      </UtilsContext.Provider>
    );
  }
}
