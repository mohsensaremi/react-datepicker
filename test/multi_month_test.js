import { shallow } from "enzyme";
import React from "react";
import { withContext } from "shallow-with-context";
import dateFnsProvider from "../provider/date-fns";
import Calendar from "../src/calendar";
import { DateUtils } from "../src/date_utils";
import Month from "../src/month";
import YearDropdown from "../src/year_dropdown";

describe("Multi month calendar", function () {
  const utils = DateUtils(dateFnsProvider);
  const ComponentWithContext = withContext(Calendar, utils);

  var dateFormat = "LLLL yyyy";

  function getCalendar(extraProps) {
    return shallow(
      <ComponentWithContext
        dateFormat={dateFormat}
        onSelect={() => {}}
        onClickOutside={() => {}}
        hideCalendar={() => {}}
        dropdownMode="scroll"
        {...extraProps}
      />,
      { context: utils }
    );
  }

  it("should render multiple months if the months property is present", () => {
    var calendar = getCalendar({ monthsShown: 2 });
    var months = calendar.find(Month);
    expect(months).to.have.length(2);
  });

  it("should render dropdown only on first month", () => {
    var calendar = getCalendar({ monthsShown: 2, showYearDropdown: true });
    var datepickers = calendar.find(YearDropdown);
    expect(datepickers).to.have.length(1);
  });

  it("should render previous months", () => {
    var calendar = getCalendar({ monthsShown: 2, showPreviousMonths: true });
    var monthDate = calendar.find(Month).first().prop("day");
    var previousMonth = utils.subMonths(utils.newDate(), 1);
    expect(utils.isSameMonth(previousMonth, monthDate)).to.be.true;
  });
});
