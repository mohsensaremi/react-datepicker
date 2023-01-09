import React from "react";
import { mount } from "enzyme";
import DatePicker from "../src/index.jsx";
import { UtilsContextProvider } from "../src/context";
import { DateUtils } from "../src/date_utils";
import * as dateFnsProvider from "../provider/date-fns";

describe("DatePicker", () => {
  const utils = DateUtils(dateFnsProvider);
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should disable times specified in excludeTimes props", () => {
    var now = utils.newDate();
    var datePicker = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          showTimeSelect
          excludeTimes={[
            utils.setTime(now, { hours: 17, minutes: 0 }),
            utils.setTime(now, { hours: 18, minutes: 30 }),
            utils.setTime(now, { hours: 19, minutes: 30 }),
            utils.setTime(now, { hours: 17, minutes: 30 }),
          ]}
        />
      </UtilsContextProvider>
    );
    expect(datePicker.find(".react-datepicker__time-list-item--disabled")).to
      .exist;
  });
});
