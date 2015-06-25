"use strict";
import parsimmon = require("parsimmon");
import IndentResult = require("./IndentResult");
import Scenario = require("../scenario/Scenario");

class ScenarioResult implements parsimmon.Result<Scenario> {
    private result: parsimmon.Result<IndentResult<Scenario>>;

    get value() {
        return this.result.value.value;
    }

    get status() {
        return this.result.status;
    }

    get index() {
        return this.result.index;
    }

    get expected() {
        return this.result.expected;
    }

    constructor(res: parsimmon.Result<IndentResult<Scenario>>) {
        this.result = res;
    }
}
export = ScenarioResult;
