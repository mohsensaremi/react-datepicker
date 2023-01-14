import { mount } from "enzyme";
import React from "react";
import dateFnsProvider from "../provider/date-fns";
import { UtilsContextProvider } from "../src/context";
import { DateUtils } from "../src/date_utils";
import DatePicker from "../src/index.jsx";

describe("DatePicker", () => {
  const utils = DateUtils(dateFnsProvider);
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should only display times between minTime and maxTime", () => {
    var now = utils.newDate();
    var datePicker = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          showTimeSelect
          selected={now}
          onChange={() => null}
          minTime={utils.setTime(now, { hours: 17, minutes: 0 })}
          maxTime={utils.setTime(now, { hours: 18, minutes: 0 })}
        />
      </UtilsContextProvider>
    );
    var times = datePicker.find("li.react-datepicker__time-list-item");
    expect(times).to.exist;
  });
});
