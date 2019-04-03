const {performance} = require("perf_hooks");

const color = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    reset: "\x1b[0m"
};
const cline = (textColor, message) =>
    `${color[textColor]}${message}${color.reset}`;
const consoleLog = {};
for (const name of Object.keys(color)) {
    consoleLog[name] = (msg, ...args) =>
        console.log(cline(name, msg), ...args);
}

class Report {
    jasmineStarted() {
        this.tab = "";
        this.failedSpecs = [];
        this.suiteChain = [];
        this.count = {pass: 0, fail: 0, warn: 0};
        this.start = performance.now();
        console.log("Starting tests");
    }
    suiteStarted(suite) {
        consoleLog.cyan(`${this.tab}${suite.description}`);
        this.tab = `${this.tab}  `;
        this.suiteChain.push(suite.description);
    }
    specStarted(spec) {
        process.stdout.write(`${this.tab}* ${spec.description}`);
    }
    specDone(spec) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        if (spec.failedExpectations.length === 0) {
            this.count.pass += 1;
            if (spec.passedExpectations.length > 0) {
                consoleLog.green(`${this.tab}✓ ${spec.description}`);
            }
            else {
                this.count.warn += 1;
                consoleLog.yellow(`${this.tab}? ${spec.description} (No expectations)`);
            }
        }
        else {
            this.count.fail += 1;
            consoleLog.red(`${this.tab}✘ ${spec.description}`);
            for (const {message} of spec.failedExpectations) {
                consoleLog.red(`${this.tab}  - ${message}`);
            }
        }
    }
    suiteDone(suite) {
        this.tab = this.tab.slice(2);
        this.suiteChain.pop();
    }
    jasmineDone(results) {
        const time = performance.now() - this.start;
        const {pass, fail, warn} = this.count;
        const total = pass + fail;
        const rate = {
            pass: (pass * 100) / total
        };
        rate.fail = 100 - rate.pass;

        console.log("");
        consoleLog.green(`${pass}/${total} (${rate.pass}%) passed`);
        consoleLog.red(`${fail}/${total} (${rate.fail}%) failed`);
        if (warn > 0) {
            consoleLog.yellow(`${warn} test(s) without any expectations`);
        }
        console.log(`Finished in ${time.toFixed(4)}ms`);
    }
}

module.exports = Report;
