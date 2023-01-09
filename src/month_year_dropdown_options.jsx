import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { UtilsContext } from "./context";

function generateMonthYears(context, minDate, maxDate) {
  const { addMonths, getStartOfMonth, newDate, isAfter } = context;

  const list = [];

  let currDate = getStartOfMonth(minDate);
  const lastDate = getStartOfMonth(maxDate);

  while (!isAfter(currDate, lastDate)) {
    list.push(newDate(currDate));

    currDate = addMonths(currDate, 1);
  }
  return list;
}

export default class MonthYearDropdownOptions extends React.Component {
  static propTypes = {
    minDate: PropTypes.instanceOf(Date).isRequired,
    maxDate: PropTypes.instanceOf(Date).isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    scrollableMonthYearDropdown: PropTypes.bool,
    date: PropTypes.instanceOf(Date).isRequired,
    dateFormat: PropTypes.string.isRequired,
    locale: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      monthYearsList: generateMonthYears(
        this.context,
        this.props.minDate,
        this.props.maxDate
      ),
    };
  }

  static contextType = UtilsContext;

  renderOptions = () => {
    const { formatDate, isSameMonth, isSameYear, getTime } = this.context;

    return this.state.monthYearsList.map((monthYear) => {
      const monthYearPoint = getTime(monthYear);
      const isSameMonthYear =
        isSameYear(this.props.date, monthYear) &&
        isSameMonth(this.props.date, monthYear);

      return (
        <div
          className={
            isSameMonthYear
              ? "react-datepicker__month-year-option--selected_month-year"
              : "react-datepicker__month-year-option"
          }
          key={monthYearPoint}
          onClick={this.onChange.bind(this, monthYearPoint)}
          aria-selected={isSameMonthYear ? "true" : undefined}
        >
          {isSameMonthYear ? (
            <span className="react-datepicker__month-year-option--selected">
              ✓
            </span>
          ) : (
            ""
          )}
          {formatDate(monthYear, this.props.dateFormat, this.props.locale)}
        </div>
      );
    });
  };

  onChange = (monthYear) => this.props.onChange(monthYear);

  handleClickOutside = () => {
    this.props.onCancel();
  };

  render() {
    let dropdownClass = classNames({
      "react-datepicker__month-year-dropdown": true,
      "react-datepicker__month-year-dropdown--scrollable":
        this.props.scrollableMonthYearDropdown,
    });

    return <div className={dropdownClass}>{this.renderOptions()}</div>;
  }
}
