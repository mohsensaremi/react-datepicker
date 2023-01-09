import { enGB, enUS } from "date-fns/locale";
import { mount } from "enzyme";
import defer from "lodash/defer";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-dom/test-utils";
import * as dateFnsProvider from "../provider/date-fns";
import { UtilsContextProvider } from "../src/context";
import { DateUtils } from "../src/date_utils";
import Day from "../src/day";
import DatePicker from "../src/index.jsx";
import Month from "../src/month.jsx";
import PopperComponent from "../src/popper_component.jsx";
import WeekNumber from "../src/week_number";
import CustomInput from "./helper_components/custom_input.jsx";
import TestWrapper from "./test_wrapper.jsx";

function getKey(key) {
  switch (key) {
    case "Backspace":
      return { key, code: 8, which: 8 };
    case "Tab":
      return { key, code: 9, which: 9 };
    case "Enter":
      return { key, code: 13, which: 13 };
    case "Escape":
      return { key, code: 27, which: 27 };
    case "PageUp":
      return { key, keyCode: 33, which: 33 };
    case "PageDown":
      return { key, keyCode: 34, which: 34 };
    case "End":
      return { key, keyCode: 35, which: 35 };
    case "Home":
      return { key, keyCode: 36, which: 36 };
    case "ArrowLeft":
      return { key, code: 37, which: 37 };
    case "ArrowUp":
      return { key, code: 38, which: 38 };
    case "ArrowRight":
      return { key, code: 39, which: 39 };
    case "ArrowDown":
      return { key, code: 40, which: 40 };
    case "x":
      return { key, code: 88, which: 88 };
  }
  throw new Error("Unknown key :" + key);
}

function getSelectedDayNode(datePicker) {
  return (
    datePicker.calendar &&
    datePicker.calendar.componentNode.querySelector(
      '.react-datepicker__day[tabindex="0"]'
    )
  );
}

describe("DatePicker", () => {
  const utils = DateUtils(dateFnsProvider);

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should show the calendar when focusing on the date input", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;

    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.calendar).to.exist;
  });

  it("should allow the user to supply a wrapper component for the popper", () => {
    var wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker popperContainer={TestWrapper} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();

    const dateInput = datePicker.instance().input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));

    expect(wrapper.find(".test-wrapper").length).to.equal(1);
    expect(datePicker.instance().calendar).to.exist;
  });

  it("should allow the user to pass a wrapper component for the calendar", () => {
    var wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker calendarContainer={TestWrapper} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();

    let dateInput = datePicker.instance().input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));

    datePicker.update();
    expect(wrapper.find(".test-wrapper").length).to.equal(1);
    expect(datePicker.instance().calendar).to.exist;
  });

  it("should pass a custom class to the popper container", () => {
    var wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker popperClassName="some-class-name" />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();

    var dateInput = datePicker.instance().input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));

    datePicker.update();
    const popper = wrapper.find(".react-datepicker-popper");
    expect(popper.length).to.equal(1);
    expect(popper.hasClass("some-class-name")).to.equal(true);
  });

  it("should show the calendar when clicking on the date input", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.click(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.calendar).to.exist;
  });

  it("should render the calendar in the portalHost prop when provided", () => {
    var root = document.createElement("div");
    var shadow = root.attachShadow({ mode: "closed" });
    var appHost = document.createElement("div");
    shadow.appendChild(appHost);
    var wrapper = ReactDOM.render(
      <UtilsContextProvider utils={utils}>
        <DatePicker portalId="test-portal" portalHost={shadow} />
      </UtilsContextProvider>,
      appHost
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.click(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.calendar).to.exist;
    expect(shadow.getElementById("test-portal")).to.exist;
  });

  it("should not set open state when it is disabled and gets clicked", function () {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker disabled />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.click(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.state.open).to.be.false;
  });

  it("should close the popper and return focus to the date input.", (done) => {
    // https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/datepicker-dialog.html
    // Date Picker Dialog | Escape | Closes the dialog and returns focus to the Choose Date button.
    var div = document.createElement("div");
    document.body.appendChild(div);
    var wrapper = ReactDOM.render(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>,
      div
    );
    const datePicker = wrapper.children;

    // user focuses the input field, the calendar opens
    var dateInput = div.querySelector("input");
    TestUtils.Simulate.focus(dateInput);

    // user may tab or arrow down to the current day (or some other element in the popper)
    var today = div.querySelector(".react-datepicker__day--today");
    today.focus();

    // user hits Escape
    TestUtils.Simulate.keyDown(today, getKey("Escape"));

    defer(() => {
      expect(datePicker.calendar).to.not.exist;
      expect(datePicker.state.preventFocus).to.be.false;
      expect(document.activeElement).to.equal(div.querySelector("input"));
      done();
    });
  });

  it("should not re-focus the date input when focusing the year dropdown", (done) => {
    const onBlurSpy = sandbox.spy();
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          onBlur={onBlurSpy}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    const dateInput = datePicker.instance().input;
    const dateInputWrapper = wrapper.find("input");
    const focusSpy = sandbox.spy(dateInput, "focus");

    dateInputWrapper.simulate("focus");
    const calendarWrapper = wrapper.find("Calendar");
    const yearSelect = calendarWrapper.find(".react-datepicker__year-select");
    dateInputWrapper.simulate("blur");
    yearSelect.simulate("focus");

    defer(() => {
      assert(focusSpy.called === false, "should not refocus the date input");
      assert(onBlurSpy.called === false, "should not call DatePicker onBlur");
      done();
    });
  });

  it("should fire onYearChange when the year is selected", (done) => {
    const onYearChangeSpy = sinon.spy();
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          showYearDropdown
          dropdownMode="select"
          onYearChange={onYearChangeSpy}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    const dateInputWrapper = wrapper.find("input");

    dateInputWrapper.simulate("click");
    const calendarWrapper = wrapper.find("Calendar");
    const yearSelect = calendarWrapper.find(".react-datepicker__year-select");
    yearSelect.simulate("change");

    defer(() => {
      assert(onYearChangeSpy.called === true, "onYearChange should be called");
      done();
    });
  });

  it("should keep the calendar shown when clicking the calendar", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    TestUtils.Simulate.click(ReactDOM.findDOMNode(datePicker.calendar));
    expect(datePicker.calendar).to.exist;
  });

  it("should not set open state when it is disabled and gets clicked", function () {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker disabled />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.click(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.state.open).to.be.false;
  });

  it("should not set open state when it is readOnly and gets clicked", function () {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker readOnly />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.click(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.state.open).to.be.false;
  });

  it("should hide the calendar when clicking a day on the calendar", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    var day = TestUtils.scryRenderedComponentsWithType(
      datePicker.calendar,
      Day
    )[0];
    TestUtils.Simulate.click(ReactDOM.findDOMNode(day));
    expect(datePicker.calendar).to.not.exist;
  });

  it("should not hide the calendar when clicking a day on the calendar and shouldCloseOnSelect prop is false", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker shouldCloseOnSelect={false} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    var day = TestUtils.scryRenderedComponentsWithType(
      datePicker.calendar,
      Day
    )[0];
    TestUtils.Simulate.click(ReactDOM.findDOMNode(day));
    expect(datePicker.state.open).to.be.true;
  });

  it("should set open to true if showTimeInput is true", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker shouldCloseOnSelect={false} showTimeInput />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var handleTimeChange = datePicker.handleTimeChange;
    handleTimeChange("13:00");
    expect(datePicker.state.open).to.be.true;
  });

  it("should not hide the calendar when selecting a day in the calendar with Enter press, and shouldCloseOnSelect prop is false", () => {
    var data = getOnInputKeyDownStuff({ shouldCloseOnSelect: false });
    var dateInput = data.datePicker.input;

    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowUp"));
    TestUtils.Simulate.keyDown(
      ReactDOM.findDOMNode(dateInput),
      getKey("Enter")
    );
    expect(data.datePicker.state.open).to.be.true;
  });

  it("should update the preSelection state when a day is selected with Enter press", () => {
    var data = getOnInputKeyDownStuff({ shouldCloseOnSelect: false });

    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowDown")
    );
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowDown")
    );
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("Enter")
    );

    data.copyM = utils.addWeeks(data.copyM, 2);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });

  xit("should update the preSelection state when a day is selected with mouse click", () => {
    var data = getOnInputKeyDownStuff({
      shouldCloseOnSelect: false,
    });

    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown")); // put focus on current day
    var today = getSelectedDayNode(data.datePicker); // store current day node
    var dayToClick = today.nextElementSibling || today.previousElementSibling; // choose next or previous day
    TestUtils.Simulate.click(dayToClick); // will update the preSelection
    data.copyM = today.nextElementSibling
      ? utils.addDays(data.copyM, 1)
      : utils.subDays(data.copyM, 1); // update copyM to expected date

    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });

  it("should update the preSelection state when Today button is clicked after selecting a different day for inline mode", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          todayButton="Today"
          selected={utils.newDate()}
          inline
          onChange={(d) => {
            var date = d;
          }}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;

    var today = getSelectedDayNode(datePicker);
    var anyOtherDay = today.nextElementSibling || today.previousElementSibling;
    TestUtils.Simulate.click(anyOtherDay); // will update the preSelection to next or previous day

    var todayBtn = datePicker.calendar.componentNode.querySelector(
      ".react-datepicker__today-button"
    );
    TestUtils.Simulate.click(todayBtn); // will update the preSelection

    expect(
      utils.formatDate(datePicker.state.preSelection, "yyyy-MM-dd")
    ).to.equal(utils.formatDate(utils.newDate(), "yyyy-MM-dd"));
  });

  it("should hide the calendar when pressing enter in the date input", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    TestUtils.Simulate.keyDown(
      ReactDOM.findDOMNode(dateInput),
      getKey("Enter")
    );
    expect(datePicker.calendar).to.not.exist;
  });

  it("should hide the calendar when the pressing escape in the date input", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    TestUtils.Simulate.keyDown(
      ReactDOM.findDOMNode(dateInput),
      getKey("Escape")
    );
    expect(datePicker.calendar).to.not.exist;
  });

  it("should not apply the react-datepicker-ignore-onclickoutside class to the date input when closed", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    expect(ReactDOM.findDOMNode(dateInput).className).to.not.contain(
      "react-datepicker-ignore-onclickoutside"
    );
  });

  it("should apply the react-datepicker-ignore-onclickoutside class to date input when open", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    expect(ReactDOM.findDOMNode(dateInput).className).to.contain(
      "react-datepicker-ignore-onclickoutside"
    );
  });

  it("should set the type attribute on the clear button to button", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker selected={utils.newDate("2015-12-15")} isClearable />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var clearButton = TestUtils.findRenderedDOMComponentWithClass(
      datePicker,
      "react-datepicker__close-icon"
    );
    expect(clearButton.type).to.equal("button");
  });

  it("should allow clearing the date when isClearable is true", () => {
    var cleared = false;
    function handleChange(d) {
      if (d === null) {
        cleared = true;
      }
    }
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={utils.newDate("2015-12-15")}
          isClearable
          onChange={handleChange}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var clearButton = TestUtils.findRenderedDOMComponentWithClass(
      datePicker,
      "react-datepicker__close-icon"
    );
    TestUtils.Simulate.click(clearButton);
    expect(cleared).to.be.true;
  });

  it("should clear input value in the local state", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker selected={utils.newDate("2015-12-15")} isClearable />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var clearButton = TestUtils.findRenderedDOMComponentWithClass(
      datePicker,
      "react-datepicker__close-icon"
    );
    TestUtils.Simulate.click(clearButton);
    expect(datePicker.state.inputValue).to.be.null;
  });

  it("should set the title attribute on the clear button if clearButtonTitle is supplied", () => {
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={utils.newDate("2018-03-19")}
          isClearable
          clearButtonTitle="clear button"
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    const clearButtonText = TestUtils.findRenderedDOMComponentWithClass(
      datePicker,
      "react-datepicker__close-icon"
    ).getAttribute("title");
    expect(clearButtonText).to.equal("clear button");
  });

  it("should customize the className attribute on the clear button if clearButtonClassName is supplied", () => {
    let wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker selected={utils.newDate("2021-04-15")} isClearable />
      </UtilsContextProvider>
    );
    let datePicker = wrapper.children;
    let clearButtonClass = TestUtils.findRenderedDOMComponentWithClass(
      datePicker,
      "react-datepicker__close-icon"
    ).getAttribute("class");
    expect(clearButtonClass).to.equal("react-datepicker__close-icon");

    wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={utils.newDate("2021-04-15")}
          isClearable
          clearButtonClassName="customized-close-icon"
        />
      </UtilsContextProvider>
    );
    datePicker = wrapper.children;
    clearButtonClass = TestUtils.findRenderedDOMComponentWithClass(
      datePicker,
      "react-datepicker__close-icon"
    ).getAttribute("class");
    expect(clearButtonClass).to.equal(
      "react-datepicker__close-icon customized-close-icon"
    );
  });

  it("should save time from the selected date during day change", () => {
    const selected = utils.newDate("2015-12-20 10:11:12");
    let date;

    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          inline
          selected={selected}
          onChange={(d) => {
            date = d;
          }}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dayButton = TestUtils.scryRenderedDOMComponentsWithClass(
      datePicker,
      "react-datepicker__day"
    )[0];
    TestUtils.Simulate.click(dayButton);

    expect(utils.getHours(date)).to.equal(10);
    expect(utils.getMinutes(date)).to.equal(11);
    expect(utils.getSeconds(date)).to.equal(12);
  });

  it("should save time from the selected date during date change", () => {
    const selected = utils.newDate("2015-12-20 10:11:12");
    let date;

    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={selected}
          onChange={(d) => {
            date = d;
          }}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;

    var input = ReactDOM.findDOMNode(datePicker.input);
    input.value = utils.newDate("2014-01-02");
    TestUtils.Simulate.change(input);

    expect(utils.getHours(date)).to.equal(10);
    expect(utils.getMinutes(date)).to.equal(11);
    expect(utils.getSeconds(date)).to.equal(12);
  });

  it("should mount and unmount properly", (done) => {
    class TestComponent extends React.Component {
      constructor(props) {
        super(props);
        this.state = { mounted: true };
      }

      render() {
        return this.state.mounted ? (
          <UtilsContextProvider utils={utils}>
            <DatePicker />
          </UtilsContextProvider>
        ) : null;
      }
    }
    var element = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <TestComponent />
      </UtilsContextProvider>
    );
    element.setState({ mounted: false }, done);
  });

  it("should render calendar inside PopperComponent when inline prop is not set", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;

    expect(function () {
      TestUtils.findRenderedComponentWithType(datePicker, PopperComponent);
    }).to.not.throw();
  });

  it("should render calendar directly without PopperComponent when inline prop is set", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker inline />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;

    expect(function () {
      TestUtils.findRenderedComponentWithType(datePicker, PopperComponent);
    }).to.throw();
    expect(datePicker.calendar).to.exist;
  });

  it("should ignore disable prop when inline prop is set", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker inline disabled />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;

    expect(datePicker.calendar).to.exist;
  });

  it("should ignore withPortal prop when inline prop is set", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker inline withPortal />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;

    expect(function () {
      TestUtils.findRenderedDOMComponentWithClass(
        datePicker,
        "react-datepicker__portal"
      );
    }).to.throw();
  });

  it("should render Calendar in portal when withPortal is set and input has focus", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker withPortal />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));

    expect(function () {
      TestUtils.findRenderedDOMComponentWithClass(
        datePicker,
        "react-datepicker__portal"
      );
    }).to.not.throw();
    expect(datePicker.calendar).to.exist;
  });

  it("should render Calendar in portal when withPortal is set and should close on Escape key when focus is on header", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker withPortal portalId="portal-id-dom-test" />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));

    expect(function () {
      TestUtils.findRenderedDOMComponentWithClass(
        datePicker,
        "react-datepicker__portal"
      );
    }).to.not.throw();
    expect(datePicker.calendar).to.exist;

    var header = TestUtils.scryRenderedDOMComponentsWithClass(
      datePicker,
      "react-datepicker__current-month"
    )[0];

    TestUtils.Simulate.click(ReactDOM.findDOMNode(header));

    TestUtils.Simulate.keyDown(ReactDOM.findDOMNode(header), getKey("Escape"));

    expect(datePicker.calendar).to.not.exist;
  });

  it("should not render Calendar when withPortal is set and no focus is given to input", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker withPortal />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;

    expect(function () {
      TestUtils.findRenderedDOMComponentWithClass(
        datePicker,
        "react-datepicker__portal"
      );
    }).to.throw();
    expect(datePicker.calendar).not.to.exist;
  });

  it("should render Calendar in a ReactDOM portal when withPortal is set and portalId is set", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker withPortal portalId="portal-id-dom-test" />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));

    expect(document.getElementById("portal-id-dom-test")).to.exist;
  });

  function getOnInputKeyDownStuff(opts) {
    opts = opts || {};
    var m = utils.newDate();
    var copyM = utils.newDate(m);
    var testFormat = "yyyy-MM-dd";
    var exactishFormat = "yyyy-MM-dd hh: zzzz";
    var callback = sandbox.spy();
    var onInputErrorCallback = sandbox.spy();

    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={m}
          onChange={callback}
          onInputError={onInputErrorCallback}
          dateFormat={testFormat}
          {...opts}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    var nodeInput = ReactDOM.findDOMNode(dateInput);
    var dateCalendar = datePicker.calendar;
    TestUtils.Simulate.focus(nodeInput);
    return {
      m,
      copyM,
      testFormat,
      exactishFormat,
      callback,
      onInputErrorCallback,
      datePicker,
      dateInput,
      nodeInput,
      dateCalendar,
    };
  }
  it("should handle onDayKeyDown ArrowLeft", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowLeft")
    );
    data.copyM = utils.subDays(data.copyM, 1);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should handle onDayKeyDown ArrowRight", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowRight")
    );
    data.copyM = utils.addDays(data.copyM, 1);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should handle onDayKeyDown ArrowUp", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowUp")
    );
    data.copyM = utils.subWeeks(data.copyM, 1);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should handle onDayKeyDown ArrowDown", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowDown")
    );
    data.copyM = utils.addWeeks(data.copyM, 1);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should handle onDayKeyDown PageUp", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("PageUp")
    );
    data.copyM = utils.subMonths(data.copyM, 1);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should handle onDayKeyDown PageDown", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("PageDown")
    );
    data.copyM = utils.addMonths(data.copyM, 1);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should handle onDayKeyDown End", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("End")
    );
    data.copyM = utils.addYears(data.copyM, 1);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should handle onDayKeyDown Home", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("Home")
    );
    data.copyM = utils.subYears(data.copyM, 1);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should not preSelect date if not between minDate and maxDate", () => {
    var data = getOnInputKeyDownStuff({
      minDate: utils.subDays(utils.newDate(), 1),
      maxDate: utils.addDays(utils.newDate(), 1),
    });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should not preSelect date if before minDate", () => {
    var data = getOnInputKeyDownStuff({
      minDate: utils.subDays(utils.newDate(), 1),
    });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowUp"));
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should not preSelect date if after maxDate", () => {
    var data = getOnInputKeyDownStuff({
      maxDate: utils.addDays(utils.newDate(), 1),
    });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });

  it("should be possible to preSelect minDate (no maxDate set)", () => {
    var data = getOnInputKeyDownStuff({
      minDate: utils.newDate(),
    });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowRight")
    );
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowLeft")
    );
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(
      utils.formatDate(data.datePicker.props.minDate, data.testFormat)
    );
  });

  it("should be possible to preSelect minDate (maxDate set)", () => {
    var data = getOnInputKeyDownStuff({
      minDate: utils.newDate(),
      maxDate: utils.addDays(utils.newDate(), 20),
    });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowRight")
    );
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowLeft")
    );
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(
      utils.formatDate(data.datePicker.props.minDate, data.testFormat)
    );
  });

  it("should be possible to preSelect maxDate (no minDate set)", () => {
    var data = getOnInputKeyDownStuff({
      maxDate: utils.addDays(utils.newDate(), 1),
    });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowRight")
    );
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(
      utils.formatDate(data.datePicker.props.maxDate, data.testFormat)
    );
  });

  it("should be possible to preSelect maxDate (minDate set)", () => {
    var data = getOnInputKeyDownStuff({
      minDate: utils.subDays(utils.newDate(), 20),
      maxDate: utils.addDays(utils.newDate(), 1),
    });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowRight")
    );
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(
      utils.formatDate(data.datePicker.props.maxDate, data.testFormat)
    );
  });

  it("should not clear the preSelect date when a pressed key is not a navigation key", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("x"));
    expect(data.datePicker.state.preSelection.valueOf()).to.equal(
      data.copyM.valueOf()
    );
  });

  describe("when update the datepicker input text while props.minDate is set", () => {
    let datePicker;
    beforeEach(() => {
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={new Date("1993-07-02")}
            minDate={new Date("1800/01/01")}
            open
          />
        </UtilsContextProvider>
      );
      datePicker = wrapper.children;
    });

    it("should auto update calendar when the updated date text is after props.minDate", () => {
      TestUtils.Simulate.change(datePicker.input, {
        target: {
          value: "1801/01/01",
        },
      });

      expect(datePicker.input.value).to.equal("1801/01/01");
      expect(
        datePicker.calendar.componentNode.querySelector(
          ".react-datepicker__current-month"
        ).innerHTML
      ).to.equal("January 1801");
    });

    it("should not auto update calendar when the updated date text is before props.minDate", () => {
      TestUtils.Simulate.change(datePicker.input, {
        target: {
          value: "1799/01/01",
        },
      });

      expect(
        datePicker.calendar.componentNode.querySelector(
          ".react-datepicker__current-month"
        ).innerHTML
      ).to.equal("July 1993");
    });
  });

  it("should not manual select date if before minDate", () => {
    var minDate = utils.subDays(utils.newDate(), 1);
    var data = getOnInputKeyDownStuff({
      minDate: minDate,
    });
    TestUtils.Simulate.change(data.nodeInput, {
      target: {
        value: utils.formatDate(utils.subDays(minDate, 1), data.testFormat),
      },
    });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("Enter"));
    expect(data.callback.calledOnce).to.be.false;
  });
  it("should not manual select date if after maxDate", () => {
    var maxDate = utils.addDays(utils.newDate(), 1);
    var data = getOnInputKeyDownStuff({
      maxDate: maxDate,
    });
    TestUtils.Simulate.change(data.nodeInput, {
      target: {
        value: utils.formatDate(utils.addDays(maxDate, 1), data.testFormat),
      },
    });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("Enter"));
    expect(data.callback.calledOnce).to.be.false;
  });
  describe("onInputKeyDown Enter", () => {
    it("should update the selected date", () => {
      var data = getOnInputKeyDownStuff();
      TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown")); // puts focus on the calendar day
      TestUtils.Simulate.keyDown(
        getSelectedDayNode(data.datePicker),
        getKey("ArrowLeft")
      );
      TestUtils.Simulate.keyDown(
        getSelectedDayNode(data.datePicker),
        getKey("Enter")
      );

      data.copyM = utils.subDays(data.copyM, 1);
      expect(data.callback.calledOnce).to.be.true;
      var result = data.callback.args[0][0];
      expect(utils.formatDate(result, data.testFormat)).to.equal(
        utils.formatDate(data.copyM, data.testFormat)
      );
    });
    it("should update the selected date on manual input", () => {
      var data = getOnInputKeyDownStuff();
      TestUtils.Simulate.change(data.nodeInput, {
        target: { value: "02/02/2017" },
      });
      TestUtils.Simulate.keyDown(data.nodeInput, getKey("Enter"));
      data.copyM = utils.newDate("2017-02-02");
      expect(
        utils.formatDate(data.callback.args[0][0], data.testFormat)
      ).to.equal(utils.formatDate(data.copyM, data.testFormat));
    });
    it("should not select excludeDates", () => {
      var data = getOnInputKeyDownStuff({
        excludeDates: [utils.subDays(utils.newDate(), 1)],
      });
      TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowLeft"));
      TestUtils.Simulate.keyDown(data.nodeInput, getKey("Enter"));
      expect(data.callback.calledOnce).to.be.false;
    });
    describe("with excludeDateIntervals", () => {
      it("should not select the start date of the interval", () => {
        var data = getOnInputKeyDownStuff({
          excludeDateIntervals: [
            {
              start: utils.subDays(utils.newDate(), 1),
              end: utils.addDays(utils.newDate(), 1),
            },
          ],
        });
        TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowLeft"));
        TestUtils.Simulate.keyDown(data.nodeInput, getKey("Enter"));
        expect(data.callback.calledOnce).to.be.false;
      });
      it("should not select a dates within the interval", () => {
        var data = getOnInputKeyDownStuff({
          excludeDateIntervals: [
            {
              start: utils.subDays(utils.newDate(), 1),
              end: utils.addDays(utils.newDate(), 1),
            },
          ],
        });
        TestUtils.Simulate.keyDown(data.nodeInput, getKey("Enter"));
        expect(data.callback.calledOnce).to.be.false;
      });
      it("should not select the end date of the interval", () => {
        var data = getOnInputKeyDownStuff({
          excludeDateIntervals: [
            {
              start: utils.subDays(utils.newDate(), 1),
              end: utils.addDays(utils.newDate(), 1),
            },
          ],
        });
        TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowRight"));
        TestUtils.Simulate.keyDown(data.nodeInput, getKey("Enter"));
        expect(data.callback.calledOnce).to.be.false;
      });
    });
    it("should not select dates excluded from filterDate", () => {
      var data = getOnInputKeyDownStuff({
        filterDate: (date) =>
          utils.getDay(date) !==
          utils.getDay(utils.subDays(utils.newDate(), 1)),
      });
      TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowLeft"));
      TestUtils.Simulate.keyDown(data.nodeInput, getKey("Enter"));
      expect(data.callback.calledOnce).to.be.false;
    });
  });
  describe("onInputKeyDown Escape", () => {
    it("should not update the selected date if the date input manually it has something wrong", () => {
      var data = getOnInputKeyDownStuff();
      var preSelection = data.datePicker.state.preSelection;
      TestUtils.Simulate.keyDown(data.nodeInput, getKey("Backspace"));
      TestUtils.Simulate.keyDown(data.nodeInput, getKey("Escape"));
      expect(data.callback.calledOnce).to.be.false; // confirms that handleChange occurred
      expect(preSelection).to.equal(data.datePicker.state.preSelection); // confirms the preSelection is still the same
    });
  });
  it("should reset the keyboard selection when closed", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowLeft"));
    data.datePicker.setOpen(false);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should retain the keyboard selection when already open", () => {
    var data = getOnInputKeyDownStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    TestUtils.Simulate.keyDown(
      getSelectedDayNode(data.datePicker),
      getKey("ArrowLeft")
    );
    data.copyM = utils.subDays(data.copyM, 1);
    expect(
      utils.formatDate(data.datePicker.state.preSelection, data.testFormat)
    ).to.equal(utils.formatDate(data.copyM, data.testFormat));
  });
  it("should open the calendar when the down arrow key is pressed", () => {
    var data = getOnInputKeyDownStuff();
    data.datePicker.setOpen(false);
    expect(data.datePicker.state.open).to.be.false;
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    expect(data.datePicker.state.open).to.be.true;
  });
  it("should not open the calendar when the left arrow key is pressed", () => {
    var data = getOnInputKeyDownStuff();
    data.datePicker.setOpen(false);
    expect(data.datePicker.state.open).to.be.false;
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowLeft"));
    expect(data.datePicker.state.open).to.be.false;
  });
  it("should default to the current day on Enter", () => {
    const data = getOnInputKeyDownStuff({ selected: null });
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("Enter"));
    expect(data.callback.calledOnce).to.be.true;
    const selected = data.callback.getCall(0).args[0];
    expect(utils.formatDate(selected, data.exactishFormat)).to.equal(
      utils.formatDate(data.copyM, data.exactishFormat)
    );
  });

  it("should autofocus the input given the autoFocus prop", () => {
    var div = document.createElement("div");
    document.body.appendChild(div);
    ReactDOM.render(
      <UtilsContextProvider utils={utils}>
        <DatePicker autoFocus />
      </UtilsContextProvider>,
      div
    );
    expect(div.querySelector("input")).to.equal(document.activeElement);
  });
  it("should autofocus the input when calling the setFocus method", () => {
    var div = document.createElement("div");
    document.body.appendChild(div);
    var wrapper = ReactDOM.render(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>,
      div
    );
    const datePicker = wrapper.children;
    datePicker.setFocus();
    expect(div.querySelector("input")).to.equal(document.activeElement);
  });
  it("should clear preventFocus timeout id when component is unmounted", () => {
    var div = document.createElement("div");
    document.body.appendChild(div);
    var wrapper = ReactDOM.render(
      <UtilsContextProvider utils={utils}>
        <DatePicker inline />
      </UtilsContextProvider>,
      div
    );
    const datePicker = wrapper.children;
    datePicker.clearPreventFocusTimeout = sinon.spy();
    ReactDOM.unmountComponentAtNode(div);
    assert(
      datePicker.clearPreventFocusTimeout.calledOnce,
      "should call clearPreventFocusTimeout"
    );
  });

  function getOnInputKeyDownDisabledKeyboardNavigationStuff() {
    var m = utils.newDate();
    var copyM = utils.newDate(m);
    var testFormat = "yyyy-MM-dd";
    var callback = sandbox.spy();
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={m}
          onChange={callback}
          disabledKeyboardNavigation
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    var nodeInput = ReactDOM.findDOMNode(dateInput);
    TestUtils.Simulate.focus(nodeInput);
    return {
      m,
      copyM,
      testFormat,
      callback,
      datePicker,
      dateInput,
      nodeInput,
    };
  }
  it("should not handle onInputKeyDown ArrowLeft", () => {
    var data = getOnInputKeyDownDisabledKeyboardNavigationStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowLeft"));
    expect(data.callback.called).to.be.false;
  });
  it("should not handle onInputKeyDown ArrowRight", () => {
    var data = getOnInputKeyDownDisabledKeyboardNavigationStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowRight"));
    expect(data.callback.called).to.be.false;
  });
  it("should not handle onInputKeyDown ArrowUp", () => {
    var data = getOnInputKeyDownDisabledKeyboardNavigationStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowUp"));
    expect(data.callback.called).to.be.false;
  });
  it("should not handle onInputKeyDown ArrowDown", () => {
    var data = getOnInputKeyDownDisabledKeyboardNavigationStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("ArrowDown"));
    expect(data.callback.called).to.be.false;
  });
  it("should not handle onInputKeyDown PageUp", () => {
    var data = getOnInputKeyDownDisabledKeyboardNavigationStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("PageUp"));
    expect(data.callback.called).to.be.false;
  });
  it("should not handle onInputKeyDown PageDown", () => {
    var data = getOnInputKeyDownDisabledKeyboardNavigationStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("PageDown"));
    expect(data.callback.called).to.be.false;
  });
  it("should not handle onInputKeyDown Home", () => {
    var data = getOnInputKeyDownDisabledKeyboardNavigationStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("Home"));
    expect(data.callback.called).to.be.false;
  });
  it("should not handle onInputKeyDown End", () => {
    var data = getOnInputKeyDownDisabledKeyboardNavigationStuff();
    TestUtils.Simulate.keyDown(data.nodeInput, getKey("End"));
    expect(data.callback.called).to.be.false;
  });
  it("should correctly clear date with empty input string", () => {
    var cleared = false;
    function handleChange(d) {
      // Internally DateInput calls it's onChange prop with null
      // when the input value is an empty string
      if (d === null) {
        cleared = true;
      }
    }
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={utils.newDate("2016-11-22")}
          onChange={handleChange}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var input = ReactDOM.findDOMNode(datePicker.input);
    input.value = "";
    TestUtils.Simulate.change(input);
    expect(cleared).to.be.true;
  });
  it("should correctly update the input when the value prop changes", () => {
    const wrapper = mount(
      React.createElement((props) => (
        <UtilsContextProvider utils={utils}>
          <DatePicker {...props} />
        </UtilsContextProvider>
      ))
    );

    expect(wrapper.find("input").prop("value")).to.equal("");
    wrapper.setProps({ value: "foo" });
    expect(wrapper.find("input").prop("value")).to.equal("foo");
  });
  it("should preserve user input as they are typing", () => {
    const onChange = (date) => wrapper.setProps({ selected: date });
    const wrapper = mount(
      React.createElement((props) => (
        <UtilsContextProvider utils={utils}>
          <DatePicker
            dateFormat={["yyyy-MM-dd", "MM/dd/yyyy", "MM/dd/yy"]}
            onChange={onChange}
            {...props}
          />
        </UtilsContextProvider>
      ))
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(wrapper.find("input").prop("value")).to.equal("");

    const str = "12/30/1982";
    wrapper.find("input").simulate("focus");
    str.split("").forEach((c, i) => {
      wrapper.find("input").simulate("change", {
        target: { value: wrapper.find("input").prop("value") + c },
      });
      wrapper.update();
      expect(wrapper.find("input").prop("value")).to.equal(
        str.substring(0, i + 1)
      );
    });
    expect(utils.formatDate(wrapper.prop("selected"), "yyyy-MM-dd")).to.equal(
      "1982-12-30"
    );
  });
  it("should invoke provided onChangeRaw function and should not invoke provided onSelect function on manual input change", () => {
    const inputValue = "test";
    const onChangeRawSpy = sandbox.spy();
    const onSelectSpy = sandbox.spy();
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={utils.newDate()}
          onChange={sandbox.spy()}
          onChangeRaw={onChangeRawSpy}
          onSelect={onSelectSpy}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    expect(onChangeRawSpy.called).to.be.false;
    expect(onSelectSpy.called).to.be.false;
    const input = ReactDOM.findDOMNode(datePicker.input);
    input.value = inputValue;
    TestUtils.Simulate.change(input);
    expect(onChangeRawSpy.calledOnce).to.be.true;
    expect(onChangeRawSpy.args[0][0].target.value).to.equal(inputValue);
    expect(onSelectSpy.called).to.be.false;
  });
  it("should invoke provided onChangeRaw and onSelect functions when clicking a day on the calendar", () => {
    const onChangeRawSpy = sandbox.spy();
    const onSelectSpy = sandbox.spy();
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={utils.newDate()}
          onChange={sandbox.spy()}
          onChangeRaw={onChangeRawSpy}
          onSelect={onSelectSpy}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    expect(onChangeRawSpy.called).to.be.false;
    expect(onSelectSpy.called).to.be.false;
    const input = ReactDOM.findDOMNode(datePicker.input);
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(input));
    const day = TestUtils.scryRenderedComponentsWithType(
      datePicker.calendar,
      Day
    )[0];
    TestUtils.Simulate.click(ReactDOM.findDOMNode(day));
    expect(onChangeRawSpy.calledOnce).to.be.true;
    expect(onSelectSpy.calledOnce).to.be.true;
  });
  it("should allow onChangeRaw to prevent a change", () => {
    const onChangeRaw = (e) => e.target.value > "2" && e.preventDefault();
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker onChangeRaw={onChangeRaw} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(wrapper.find("input").prop("value")).to.equal("");
    wrapper.find("input").simulate("change", { target: { value: "3" } });
    datePicker.update();
    expect(wrapper.find("input").prop("value")).to.equal("");
    wrapper.find("input").simulate("change", { target: { value: "1" } });
    datePicker.update();
    expect(wrapper.find("input").prop("value")).to.equal("1");
  });
  it("should call onChangeRaw with all arguments", () => {
    const inputValue = "test";
    const onChangeRawSpy = sandbox.spy();
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={utils.newDate()}
          onChange={sandbox.spy()}
          customInput={<CustomInput />}
          onChangeRaw={onChangeRawSpy}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    expect(onChangeRawSpy.called).to.be.false;
    const input = ReactDOM.findDOMNode(datePicker.input);
    input.value = inputValue;
    TestUtils.Simulate.change(input);
    expect(onChangeRawSpy.calledOnce).to.be.true;
    expect(onChangeRawSpy.args[0][0].target.value).to.equal(inputValue);
    expect(onChangeRawSpy.args[0][1]).to.equal("test");
  });
  it("should handle the lack of an 'event' object as the first argument to handleChange analogously to 'preventDefault' being called", () => {
    const inputValue = "test";
    const onChangeRawSpy = sandbox.spy();
    let customInput = <CustomInput onChangeArgs={(e) => [e.target.value]} />;
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          selected={utils.newDate()}
          onChange={sandbox.spy()}
          customInput={customInput}
          onChangeRaw={onChangeRawSpy}
        />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    expect(onChangeRawSpy.called).to.be.false;
    const input = ReactDOM.findDOMNode(datePicker.input);
    input.value = inputValue;
    TestUtils.Simulate.change(input);
    expect(onChangeRawSpy.calledOnce).to.be.true;
    expect(onChangeRawSpy.args[0][0]).to.equal("test");
  });
  it("should handle a click outside of the calendar", () => {
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker selected={utils.newDate()} withPortal />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first().instance();
    const openSpy = sandbox.spy(datePicker, "setOpen");
    datePicker.handleCalendarClickOutside(
      sandbox.stub({ preventDefault: () => {} })
    );
    expect(openSpy.calledOnce).to.be.true;
    expect(openSpy.calledWithExactly(false)).to.be.true;
  });
  it("should default to the currently selected date", () => {
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker selected={utils.newDate("1988-12-30")} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal("1988-12-30");
  });
  it("should default to the start date when selecting an end date", () => {
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker startDate={utils.newDate("1988-11-30")} selectsEnd />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal("1988-11-30");
  });
  it("should default to the end date when selecting a start date", () => {
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker endDate={utils.newDate("1988-12-31")} selectsStart />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal("1988-12-31");
  });
  it("should default to a date <= maxDate", () => {
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker maxDate={utils.newDate("1982-01-01")} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal("1982-01-01");
  });
  it("should default to a date >= minDate", () => {
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker minDate={utils.newDate("2063-04-05")} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal("2063-04-05");
  });
  it("should default to the openToDate if there is one", () => {
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker openToDate={utils.newDate("2020-01-23")} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal("2020-01-23");
  });
  it("should otherwise default to the current date", () => {
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal(utils.formatDate(utils.newDate(), "yyyy-MM-dd"));
  });
  it("should support an initial null `selected` value in inline mode", () => {
    const wrapper = mount(
      React.createElement((props) => (
        <UtilsContextProvider utils={utils}>
          <DatePicker inline selected={null} {...props} />
        </UtilsContextProvider>
      ))
    );
    const datePicker = wrapper.find(DatePicker).first();

    expect(() =>
      wrapper.setProps({ selected: utils.newDate() })
    ).to.not.throw();
  });
  it("should switch month in inline mode immediately", () => {
    const selected = utils.newDate();
    const future = utils.addDays(utils.newDate(), 100);
    const wrapper = mount(
      React.createElement((props) => (
        <UtilsContextProvider utils={utils}>
          <DatePicker inline selected={selected} {...props} />
        </UtilsContextProvider>
      ))
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal(utils.formatDate(selected, "yyyy-MM-dd"));
    wrapper.setProps({ selected: future });
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal(utils.formatDate(future, "yyyy-MM-dd"));
  });
  it("should switch month in inline mode immediately, when year is updated", () => {
    const selected = utils.newDate();
    const future = utils.addYears(utils.newDate(), 1);
    const wrapper = mount(
      React.createElement((props) => (
        <UtilsContextProvider utils={utils}>
          <DatePicker inline selected={selected} {...props} />
        </UtilsContextProvider>
      ))
    );
    const datePicker = wrapper.find(DatePicker).first();
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal(utils.formatDate(selected, "yyyy-MM-dd"));
    wrapper.setProps({ selected: future });
    expect(
      utils.formatDate(datePicker.state("preSelection"), "yyyy-MM-dd")
    ).to.equal(utils.formatDate(future, "yyyy-MM-dd"));
  });
  it("should not set open state when focusing on the date input and the preventOpenOnFocus prop is set", () => {
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker preventOpenOnFocus />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    const dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.state.open).to.be.false;
  });
  it("should not set open state onInputKeyDown when preventOpenOnFocus prop is set", () => {
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker preventOpenOnFocus />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    const dateInput = datePicker.input;
    TestUtils.Simulate.keyDown(
      ReactDOM.findDOMNode(dateInput),
      getKey("ArrowLeft")
    );
    expect(datePicker.state.open).to.be.false;
  });
  it("should clear the input when clear() member function is called", () => {
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker selected={utils.newDate("2015-12-15")} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    datePicker.clear();
    expect(datePicker.state.inputValue).to.be.null;
  });
  it("should not open when open is false and input is focused", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker open={false} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.calendar).to.not.exist;
  });
  it("should open when open is true", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker open />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    expect(datePicker.calendar).to.exist;
  });
  it("should fire onInputClick when input is clicked", () => {
    const onInputClickSpy = sinon.spy();
    var wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker onInputClick={onInputClickSpy} />
      </UtilsContextProvider>
    )
      .find("input")
      .simulate("click");
    assert(onInputClickSpy.callCount, 1);
  });

  it("should set monthSelectedIn to 0 if monthsShown prop changes", () => {
    const wrapper = mount(
      React.createElement((props) => (
        <UtilsContextProvider utils={utils}>
          <DatePicker monthsShown={2} inline {...props} />
        </UtilsContextProvider>
      ))
    );
    const datePicker = wrapper.find(DatePicker).first();
    datePicker.instance().setState({ monthSelectedIn: 1 }, () => {
      assert.equal(datePicker.state("monthSelectedIn"), 1);
      wrapper.setProps({ monthsShown: 1 }, () => {
        assert.equal(wrapper.props().monthsShown, 1);
        setTimeout(() => {
          // Give setState in componentDidUpdate time to run
          assert.equal(datePicker.state("monthSelectedIn"), 0);
        }, 100);
      });
    });
  });

  it("should disable non-jumping if prop focusSelectedMonth is true", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker inline monthsShown={2} focusSelectedMonth />
      </UtilsContextProvider>
    );
    const datePickerInline = wrapper.children;
    var dayButtonInline = TestUtils.scryRenderedDOMComponentsWithClass(
      datePickerInline,
      "react-datepicker__day"
    )[40];
    TestUtils.Simulate.click(dayButtonInline);
    assert.equal(datePickerInline.state.monthSelectedIn, undefined);
  });

  it("should show the popper arrow when showPopperArrow is true", () => {
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker showPopperArrow />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    const dateInput = datePicker.input;
    TestUtils.Simulate.click(ReactDOM.findDOMNode(dateInput));

    const arrow = TestUtils.scryRenderedDOMComponentsWithClass(
      datePicker.calendar,
      "react-datepicker__triangle"
    );

    expect(arrow).to.not.be.empty;
  });

  it("should not show the popper arrow when showPopperArrow is false", () => {
    const wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker showPopperArrow={false} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    const dateInput = datePicker.input;
    TestUtils.Simulate.click(ReactDOM.findDOMNode(dateInput));

    const arrow = TestUtils.scryRenderedDOMComponentsWithClass(
      datePicker.calendar,
      "react-datepicker__triangle"
    );

    expect(arrow).to.be.empty;
  });

  it("should pass chooseDayAriaLabelPrefix prop to the correct child component", () => {
    const chooseDayAriaLabelPrefix = "My choose-day-prefix";
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          inline
          chooseDayAriaLabelPrefix={chooseDayAriaLabelPrefix}
        />
      </UtilsContextProvider>
    );
    expect(
      wrapper.find(Day).first().prop("ariaLabelPrefixWhenEnabled")
    ).to.equal(chooseDayAriaLabelPrefix);
  });

  it("should pass disabledDayAriaLabelPrefix prop to the correct child component", () => {
    const disabledDayAriaLabelPrefix = "My disabled-day-prefix";
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          inline
          disabledDayAriaLabelPrefix={disabledDayAriaLabelPrefix}
        />
      </UtilsContextProvider>
    );
    expect(
      wrapper.find(Day).first().prop("ariaLabelPrefixWhenDisabled")
    ).to.equal(disabledDayAriaLabelPrefix);
  });

  it("should pass weekAriaLabelPrefix prop to the correct child component", () => {
    const weekAriaLabelPrefix = "My week-prefix";
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          inline
          showWeekNumbers
          weekAriaLabelPrefix={weekAriaLabelPrefix}
        />
      </UtilsContextProvider>
    );
    expect(wrapper.find(WeekNumber).first().prop("ariaLabelPrefix")).to.equal(
      weekAriaLabelPrefix
    );
  });

  it("should pass monthAriaLabelPrefix prop to the correct child component", () => {
    const monthAriaLabelPrefix = "My month-prefix";
    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker
          inline
          showWeekNumbers
          monthAriaLabelPrefix={monthAriaLabelPrefix}
        />
      </UtilsContextProvider>
    );
    expect(wrapper.find(Month).first().prop("ariaLabelPrefix")).to.equal(
      monthAriaLabelPrefix
    );
  });

  it("should close the calendar after scrolling", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker closeOnScroll />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.state.open).to.be.true;
    datePicker.onScroll({ target: document });
    expect(datePicker.state.open).to.be.false;
  });

  it("should not close the calendar after scrolling", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker closeOnScroll />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    datePicker.onScroll({ target: "something" });
    expect(datePicker.state.open).to.be.true;
  });

  it("should close the calendar after scrolling", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker closeOnScroll={() => true} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    expect(datePicker.state.open).to.be.true;
    datePicker.onScroll();
    expect(datePicker.state.open).to.be.false;
  });

  it("should not close the calendar after scrolling", () => {
    var wrapper = TestUtils.renderIntoDocument(
      <UtilsContextProvider utils={utils}>
        <DatePicker closeOnScroll={() => false} />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.children;
    var dateInput = datePicker.input;
    TestUtils.Simulate.focus(ReactDOM.findDOMNode(dateInput));
    datePicker.onScroll();
    expect(datePicker.state.open).to.be.true;
  });

  describe("selectsRange with inline", () => {
    it("should change dates of range when dates are empty", () => {
      const selected = utils.newDate();
      let startDate, endDate;
      const onChange = (dates = []) => {
        [startDate, endDate] = dates;
      };
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={selected}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
          />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;

      const days = TestUtils.scryRenderedComponentsWithType(datePicker, Day);
      const selectedDay = days.find(
        (d) =>
          utils.formatDate(d.props.day, "yyyy-MM-dd") ===
          utils.formatDate(selected, "yyyy-MM-dd")
      );
      TestUtils.Simulate.click(ReactDOM.findDOMNode(selectedDay));
      expect(utils.formatDate(startDate, "yyyy-MM-dd")).to.equal(
        utils.formatDate(selected, "yyyy-MM-dd")
      );
      expect(endDate).to.equal(null);
    });

    it("should change dates of range set endDate when startDate is set", () => {
      let startDate = utils.newDate();
      const nextDay = utils.addDays(startDate, 1);
      let endDate = null;
      const onChange = (dates = []) => {
        [startDate, endDate] = dates;
      };
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
          />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;
      const days = TestUtils.scryRenderedComponentsWithType(datePicker, Day);
      const selectedDay = days.find(
        (d) =>
          utils.formatDate(d.props.day, "yyyy-MM-dd") ===
          utils.formatDate(nextDay, "yyyy-MM-dd")
      );
      TestUtils.Simulate.click(ReactDOM.findDOMNode(selectedDay));
      expect(utils.formatDate(startDate, "yyyy-MM-dd")).to.equal(
        utils.formatDate(startDate, "yyyy-MM-dd")
      );
      expect(utils.formatDate(endDate, "yyyy-MM-dd")).to.equal(
        utils.formatDate(nextDay, "yyyy-MM-dd")
      );
    });

    it("should change dates of range set endDate null when range is filled", () => {
      const selected = utils.newDate();
      let [startDate, endDate] = [selected, selected];
      const onChange = (dates = []) => {
        [startDate, endDate] = dates;
      };
      let wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={selected}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
          />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;

      let days = TestUtils.scryRenderedComponentsWithType(datePicker, Day);
      let selectedDay = days.find(
        (d) =>
          utils.formatDate(d.props.day, "yyyy-MM-dd") ===
          utils.formatDate(selected, "yyyy-MM-dd")
      );
      TestUtils.Simulate.click(ReactDOM.findDOMNode(selectedDay));
      expect(utils.formatDate(startDate, "yyyy-MM-dd")).to.equal(
        utils.formatDate(selected, "yyyy-MM-dd")
      );
      expect(endDate).to.equal(null);
    });

    it("should change dates of range change startDate when endDate set before startDate", () => {
      const selected = utils.newDate();
      const selectedPrevious = utils.subDays(utils.newDate(), 3);
      let [startDate, endDate] = [selected, null];
      const onChange = (dates = []) => {
        [startDate, endDate] = dates;
      };
      let wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={selected}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
          />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;
      let days = TestUtils.scryRenderedComponentsWithType(datePicker, Day);
      const selectedDay = days.find(
        (d) =>
          utils.formatDate(d.props.day, "yyyy-MM-dd") ===
          utils.formatDate(selectedPrevious, "yyyy-MM-dd")
      );
      TestUtils.Simulate.click(ReactDOM.findDOMNode(selectedDay));
      expect(utils.formatDate(startDate, "yyyy-MM-dd")).to.equal(
        utils.formatDate(selectedPrevious, "yyyy-MM-dd")
      );
      expect(endDate).to.equal(null);
    });
  });

  describe("selectsRange without inline", () => {
    it("should have preSelection set to startDate upon opening", () => {
      const startDate = new Date("2021-04-20 00:00:00");
      const endDate = null;
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker selectsRange startDate={startDate} endDate={endDate} />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;
      const dateInput = datePicker.input;
      // Click to open
      TestUtils.Simulate.click(ReactDOM.findDOMNode(dateInput));
      expect(datePicker.state.preSelection).to.equal(startDate);
    });

    it("should remain open after clicking day when startDate is null", () => {
      const startDate = null;
      const endDate = null;
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker selectsRange startDate={startDate} endDate={endDate} />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;
      const dateInput = datePicker.input;
      // Click to open
      TestUtils.Simulate.click(ReactDOM.findDOMNode(dateInput));
      const days = TestUtils.scryRenderedComponentsWithType(datePicker, Day);
      // Click the first Day
      TestUtils.Simulate.click(ReactDOM.findDOMNode(days[0]));
      expect(datePicker.state.open).to.be.true;
    });

    it("should be closed after clicking day when startDate has a value (endDate is being selected)", () => {
      const startDate = new Date("2021-01-01 00:00:00");
      const endDate = null;
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker selectsRange startDate={startDate} endDate={endDate} />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;
      datePicker.setOpen(true);

      const days = TestUtils.scryRenderedComponentsWithType(datePicker, Day);
      const day = ReactDOM.findDOMNode(days[Math.floor(days.length / 2)]);
      TestUtils.Simulate.click(day);
      expect(datePicker.state.open).to.be.false;
    });

    it("has clear button rendered when isClearable is true and startDate has value", () => {
      const startDate = new Date("2021-01-01 00:00:00");
      const endDate = new Date("2021-01-21 00:00:00");

      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            isClearable
          />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;

      const clearButton = TestUtils.findRenderedDOMComponentWithClass(
        datePicker,
        "react-datepicker__close-icon"
      );
      expect(clearButton).to.exist;
    });

    it("clearing calls onChange with [null, null] in first argument making it consistent with the onChange behaviour for selecting days for selectsRange", () => {
      const onChangeSpy = sandbox.spy();
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selectsRange
            startDate={null}
            endDate={null}
            onChange={onChangeSpy}
            isClearable
          />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;

      datePicker.clear();

      expect(onChangeSpy.calledOnce).to.be.true;
      expect(onChangeSpy.args[0][0]).to.be.an("array");
      expect(onChangeSpy.args[0][0][0]).to.be.a("null");
      expect(onChangeSpy.args[0][0][1]).to.be.a("null");
    });
  });

  describe("duplicate dates when multiple months", () => {
    it("should find duplicates at end on all months except last month", () => {
      const twoMonths = mount(
        <UtilsContextProvider utils={utils}>
          <DatePicker monthsShown={2} />
        </UtilsContextProvider>
      );
      twoMonths.find("input").simulate("click");
      const months = twoMonths.find(Month);
      expect(months).to.have.lengthOf(2);
      expect(months.first().props().monthShowsDuplicateDaysEnd).to.be.true;
      expect(months.last().props().monthShowsDuplicateDaysEnd).to.be.false;

      const moreThanTwoMonths = mount(
        <UtilsContextProvider utils={utils}>
          <DatePicker monthsShown={4} />
        </UtilsContextProvider>
      );
      moreThanTwoMonths.find("input").simulate("click");
      const monthsMore = moreThanTwoMonths.find(Month);
      expect(monthsMore).to.have.lengthOf(4);
      expect(monthsMore.first().props().monthShowsDuplicateDaysEnd).to.be.true;
      expect(monthsMore.get(1).props.monthShowsDuplicateDaysEnd).to.be.true;
      expect(monthsMore.get(2).props.monthShowsDuplicateDaysEnd).to.be.true;
      expect(monthsMore.last().props().monthShowsDuplicateDaysEnd).to.be.false;
    });

    it("should find duplicates at start on all months except first month", () => {
      const twoMonths = mount(
        <UtilsContextProvider utils={utils}>
          <DatePicker monthsShown={2} />
        </UtilsContextProvider>
      );
      twoMonths.find("input").simulate("click");
      const months = twoMonths.find(Month);
      expect(months).to.have.lengthOf(2);
      expect(months.first().props().monthShowsDuplicateDaysStart).to.be.false;
      expect(months.last().props().monthShowsDuplicateDaysStart).to.be.true;

      const moreThanTwoMonths = mount(
        <UtilsContextProvider utils={utils}>
          <DatePicker monthsShown={4} />
        </UtilsContextProvider>
      );
      moreThanTwoMonths.find("input").simulate("click");
      const monthsMore = moreThanTwoMonths.find(Month);
      expect(monthsMore).to.have.lengthOf(4);
      expect(monthsMore.first().props().monthShowsDuplicateDaysStart).to.be
        .false;
      expect(monthsMore.get(1).props.monthShowsDuplicateDaysStart).to.be.true;
      expect(monthsMore.get(2).props.monthShowsDuplicateDaysStart).to.be.true;
      expect(monthsMore.last().props().monthShowsDuplicateDaysStart).to.be.true;
    });

    it("should not find duplicates when single month displayed", () => {
      const datepicker = mount(
        <UtilsContextProvider utils={utils}>
          <DatePicker />
        </UtilsContextProvider>
      );
      datepicker.find("input").simulate("click");
      const months = datepicker.find(Month);
      expect(months).to.have.lengthOf(1);
      expect(months.first().props().monthShowsDuplicateDaysStart).to.be.false;
      expect(months.first().props().monthShowsDuplicateDaysEnd).to.be.false;
    });
  });

  describe("shouldFocusDayInline state", () => {
    const dateFormat = "yyyy-MM-dd";

    it("should not be updated when navigating with ArrowRight key without changing displayed month", () => {
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={utils.newDate("2020-11-15")}
            dateFormat={dateFormat}
            inline
          />
        </UtilsContextProvider>
      );
      const datePickerInline = wrapper.children;
      TestUtils.Simulate.keyDown(
        getSelectedDayNode(datePickerInline),
        getKey("ArrowRight")
      );
      expect(datePickerInline.state.shouldFocusDayInline).to.be.false;
    });

    it("should be set to true when changing displayed month with ArrowRight key", () => {
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={utils.newDate("2020-11-30")}
            dateFormat={dateFormat}
            inline
          />
        </UtilsContextProvider>
      );
      const datePickerInline = wrapper.children;
      TestUtils.Simulate.keyDown(
        getSelectedDayNode(datePickerInline),
        getKey("ArrowRight")
      );
      expect(datePickerInline.state.shouldFocusDayInline).to.be.true;
    });

    it("should be set to true when changing displayed month with PageDown key", () => {
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={utils.newDate("2020-11-15")}
            dateFormat={dateFormat}
            inline
          />
        </UtilsContextProvider>
      );
      const datePickerInline = wrapper.children;
      TestUtils.Simulate.keyDown(
        getSelectedDayNode(datePickerInline),
        getKey("PageDown")
      );
      expect(datePickerInline.state.shouldFocusDayInline).to.be.true;
    });

    it("should be set to true when changing displayed month with End key", () => {
      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={utils.newDate("2020-11-15")}
            dateFormat={dateFormat}
            inline
          />
        </UtilsContextProvider>
      );
      const datePickerInline = wrapper.children;
      TestUtils.Simulate.keyDown(
        getSelectedDayNode(datePickerInline),
        getKey("End")
      );
      expect(datePickerInline.state.shouldFocusDayInline).to.be.true;
    });
  });

  it("should show the correct start of week for GB locale", () => {
    const utils = DateUtils(dateFnsProvider);
    utils.registerLocale("en-GB", enGB);

    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker locale="en-GB" />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    const dateInput = datePicker.instance().input;
    const dateInputWrapper = wrapper.find("input");
    const focusSpy = sandbox.spy(dateInput, "focus");

    dateInputWrapper.simulate("focus");

    const firstDay = wrapper
      .find(".react-datepicker__day-names")
      .childAt(0)
      .text();
    expect(firstDay).to.equal("Mo");
  });

  it("should show the correct start of week for US locale", () => {
    const utils = DateUtils(dateFnsProvider);
    utils.registerLocale("en-US", enUS);

    const wrapper = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker locale="en-US" />
      </UtilsContextProvider>
    );
    const datePicker = wrapper.find(DatePicker).first();
    const dateInput = datePicker.instance().input;
    const dateInputWrapper = wrapper.find("input");
    const focusSpy = sandbox.spy(dateInput, "focus");

    dateInputWrapper.simulate("focus");

    const firstDay = wrapper
      .find(".react-datepicker__day-names")
      .childAt(0)
      .text();
    expect(firstDay).to.equal("Su");
  });

  describe("when update the datepicker input text while props.showTimeSelectOnly is set and dateFormat has only time related format", () => {
    const format = "h:mm aa";

    it("should keep selected date in state except new time", () => {
      const selected = utils.newDate("2022-02-24 10:00:00");
      let date;

      const wrapper = TestUtils.renderIntoDocument(
        <UtilsContextProvider utils={utils}>
          <DatePicker
            selected={selected}
            onChange={(d) => {
              console.log("trigger change", d);
              date = d;
            }}
            showTimeSelect
            showTimeSelectOnly
            dateFormat={format}
            timeFormat={format}
          />
        </UtilsContextProvider>
      );
      const datePicker = wrapper.children;

      const input = ReactDOM.findDOMNode(datePicker.input);
      input.value = "8:22 AM";
      TestUtils.Simulate.change(input);

      expect(utils.isSameDay(date, selected)).to.equal(true);
      expect(utils.getHours(date)).to.equal(8);
      expect(utils.getMinutes(date)).to.equal(22);
    });
  });
});
