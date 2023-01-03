import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { UtilsContext } from "./context";

export default class Year extends React.Component {
  static propTypes = {
    date: PropTypes.string,
    disabledKeyboardNavigation: PropTypes.bool,
    onDayClick: PropTypes.func,
    preSelection: PropTypes.instanceOf(Date),
    setPreSelection: PropTypes.func,
    selected: PropTypes.object,
    inline: PropTypes.bool,
    maxDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    yearItemNumber: PropTypes.number,
  };

  constructor(props) {
    super(props);
  }

  static contextType = UtilsContext;

  YEAR_REFS = [...Array(this.props.yearItemNumber)].map(() =>
    React.createRef()
  );

  isDisabled = (date) => this.context.isDayDisabled(date, this.props);

  isExcluded = (date) => this.context.isDayExcluded(date, this.props);

  updateFocusOnPaginate = (refIndex) => {
    const waitForReRender = function () {
      this.YEAR_REFS[refIndex].current.focus();
    }.bind(this);

    window.requestAnimationFrame(waitForReRender);
  };

  handleYearClick = (day, event) => {
    if (this.props.onDayClick) {
      this.props.onDayClick(day, event);
    }
  };

  handleYearNavigation = (newYear, newDate) => {
    const { date, yearItemNumber } = this.props;
    const { startPeriod } = this.context.getYearsPeriod(date, yearItemNumber);

    if (this.isDisabled(newDate) || this.isExcluded(newDate)) return;
    this.props.setPreSelection(newDate);

    if (newYear - startPeriod === -1) {
      this.updateFocusOnPaginate(yearItemNumber - 1);
    } else if (newYear - startPeriod === yearItemNumber) {
      this.updateFocusOnPaginate(0);
    } else this.YEAR_REFS[newYear - startPeriod].current.focus();
  };

  isSameDay = (y, other) => this.context.isSameDay(y, other);

  isCurrentYear = (y) => y === this.context.getYear(this.context.newDate());

  isKeyboardSelected = (y) => {
    const date = this.context.getStartOfYear(
      this.context.setYear(this.props.date, y)
    );
    return (
      !this.props.disabledKeyboardNavigation &&
      !this.props.inline &&
      !this.context.isSameDay(
        date,
        this.context.getStartOfYear(this.props.selected)
      ) &&
      this.context.isSameDay(
        date,
        this.context.getStartOfYear(this.props.preSelection)
      )
    );
  };

  onYearClick = (e, y) => {
    const { date } = this.props;
    this.handleYearClick(
      this.context.getStartOfYear(this.context.setYear(date, y)),
      e
    );
  };

  onYearKeyDown = (e, y) => {
    const { key } = e;
    if (!this.props.disabledKeyboardNavigation) {
      switch (key) {
        case "Enter":
          this.onYearClick(e, y);
          this.props.setPreSelection(this.props.selected);
          break;
        case "ArrowRight":
          this.handleYearNavigation(
            y + 1,
            this.context.addYears(this.props.preSelection, 1)
          );
          break;
        case "ArrowLeft":
          this.handleYearNavigation(
            y - 1,
            this.context.subYears(this.props.preSelection, 1)
          );
          break;
      }
    }
  };

  getYearClassNames = (y) => {
    const { minDate, maxDate, selected } = this.props;
    return classnames("react-datepicker__year-text", {
      "react-datepicker__year-text--selected":
        y === this.context.getYear(selected),
      "react-datepicker__year-text--disabled":
        (minDate || maxDate) && this.context.isYearDisabled(y, this.props),
      "react-datepicker__year-text--keyboard-selected":
        this.isKeyboardSelected(y),
      "react-datepicker__year-text--today": this.isCurrentYear(y),
    });
  };

  getYearTabIndex = (y) => {
    if (this.props.disabledKeyboardNavigation) return "-1";
    const preSelected = this.context.getYear(this.props.preSelection);

    return y === preSelected ? "0" : "-1";
  };

  render() {
    const yearsList = [];
    const { date, yearItemNumber } = this.props;
    const { startPeriod, endPeriod } = this.context.getYearsPeriod(
      date,
      yearItemNumber
    );

    for (let y = startPeriod; y <= endPeriod; y++) {
      yearsList.push(
        <div
          ref={this.YEAR_REFS[y - startPeriod]}
          onClick={(ev) => {
            this.onYearClick(ev, y);
          }}
          onKeyDown={(ev) => {
            this.onYearKeyDown(ev, y);
          }}
          tabIndex={this.getYearTabIndex(y)}
          className={this.getYearClassNames(y)}
          key={y}
          aria-current={this.isCurrentYear(y) ? "date" : undefined}
        >
          {y}
        </div>
      );
    }

    return (
      <div className="react-datepicker__year">
        <div className="react-datepicker__year-wrapper">{yearsList}</div>
      </div>
    );
  }
}
