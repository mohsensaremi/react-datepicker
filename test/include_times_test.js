import { mount } from "enzyme";
import React from "react";
import dateFnsProvider from "../provider/date-fns";
import { UtilsContextProvider } from "../src/context";
import { DateUtils } from "../src/date_utils";
import TimeComponent from "../src/time";

describe("TimeComponent", () => {
  const utils = DateUtils(dateFnsProvider);
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should only enable times specified in includeTimes props", () => {
    const today = utils.getStartOfDay(utils.newDate());
    const timeComponent = mount(
      <UtilsContextProvider utils={utils}>
        <TimeComponent
          includeTimes={[
            utils.addMinutes(today, 60),
            utils.addMinutes(today, 120),
            utils.addMinutes(today, 150),
          ]}
        />
      </UtilsContextProvider>
    );

    const disabledItems = timeComponent.find(
      ".react-datepicker__time-list-item--disabled"
    );
    expect(disabledItems).to.have.length(45);
  });
});
