import * as DateFNS from "date-fns/esm";
import enGB from "date-fns/locale/en-GB";
import fi from "date-fns/locale/fi";
import ptBR from "date-fns/locale/pt-BR";
import range from "lodash/range";
import prismGitHubTheme from "prism-react-renderer/themes/github";
import PropTypes from "prop-types";
import React, { forwardRef, useState } from "react";
import DatePicker, { CalendarContainer } from "react-datepicker";
import { LiveEditor, LiveError, LivePreview, LiveProvider } from "react-live";
import slugify from "slugify";
import editIcon from "./edit-regular.svg";

export default class CodeExampleComponent extends React.Component {
  static propTypes = {
    example: PropTypes.object.isRequired,
  };
  componentDidMount() {
    const { utils } = this.props;
    utils.registerLocale("fi", fi);
    utils.registerLocale("pt-BR", ptBR);
    utils.registerLocale("en-GB", enGB);
  }

  render() {
    const { title, description, component } = this.props.example;
    return (
      <div
        id={`example-${slugify(title, { lower: true })}`}
        className="example"
      >
        <h2 className="example__heading">{title}</h2>
        {description && <p>{description}</p>}
        <div className="row">
          <LiveProvider
            code={component.trim()}
            scope={{
              // NB any globals added here should also be referenced in ../../examples/.eslintrc
              PropTypes,
              useState,
              DatePicker,
              CalendarContainer,
              ...DateFNS,
              range,
              fi,
              forwardRef,
            }}
            theme={prismGitHubTheme}
          >
            <pre className="example__code">
              <img
                src={editIcon}
                className="example__code__edit_icon"
                alt="edit icon"
                title="Edit the code directly on the left side and and see the output on the right"
              />
              <LiveEditor />
            </pre>
            <div className="example__preview">
              <LiveError />
              <LivePreview />
            </div>
          </LiveProvider>
        </div>
      </div>
    );
  }
}
