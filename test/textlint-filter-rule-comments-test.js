// LICENSE : MIT
"use strict";
const TextLintCore = require("textlint").TextLintCore;
const TextLintNodeType = require("textlint").TextLintNodeType;
const filterRule = require("../src/textlint-filter-rule-comments");
const reportRule = require("textlint-rule-report-node-types");
const assert = require("power-assert");
describe("textlint-rule-ignore-node-types", function () {
    context("no options", function () {
        context("when before textlint-enable", function () {
            it("should not ignored", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({
                    report: reportRule
                }, {
                    report: {
                        nodeTypes: [TextLintNodeType.Str]
                    }
                });
                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.lintMarkdown(`
This is Error.

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->
`).then(({messages}) => {
                    assert.equal(messages.length, 1);
                });
            });
        });
        context("when during disable -- enable", function () {
            it("should messages is ignored between disable and enable", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({
                    report: reportRule
                }, {
                    report: {
                        nodeTypes: [TextLintNodeType.Str]
                    }
                });

                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.lintMarkdown(`
<!-- textlint-disable -->

This is text.

<!-- textlint-enable -->
`).then(({messages}) => {
                    assert.equal(messages.length, 0);
                });
            });
        });
        context("when after textlint-enable", function () {
            it("should not ignored", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({
                    report: reportRule
                }, {
                    report: {
                        nodeTypes: [TextLintNodeType.Str]
                    }
                });

                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.lintMarkdown(`

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->

This is Error.
`).then(({messages}) => {
                    assert.equal(messages.length, 1);
                });
            });
        });
    });
    context("with ruleId options", function () {
        context("when disable <ruleA>", function () {
            it("should ignore messages of ruleA", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({
                    ruleA: reportRule
                }, {
                    ruleA: {
                        nodeTypes: [TextLintNodeType.Str]
                    }
                });

                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.lintMarkdown(`
<!-- textlint-disable ruleA -->

This is text.

<!-- textlint-enable ruleA -->
`).then(({messages}) => {
                    assert.equal(messages.length, 0);
                });
            });
            it("should not ignore messages of other rules", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({
                    ruleX: reportRule
                }, {
                    ruleX: {
                        nodeTypes: [TextLintNodeType.Str]
                    }
                });

                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.lintMarkdown(`
<!-- textlint-disable ruleA -->

This is text.

<!-- textlint-enable -->
`).then(({messages}) => {
                    assert.equal(messages.length, 1);
                });
            });
        });
        context("after textlint-enable <ruleA>", function () {
            it("should ignore messages of ruleA", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({
                    ruleA: reportRule,
                    ruleB: reportRule
                }, {
                    ruleA: {
                        nodeTypes: [TextLintNodeType.Str]
                    },
                    ruleB: {
                        nodeTypes: [TextLintNodeType.Str]
                    }
                });

                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.lintMarkdown(`

<!-- textlint-disable ruleA,ruleB -->

This is ignored. RuleA and RuleB

<!-- textlint-enable ruleA -->

This is Error of RuleA.

`).then(({messages}) => {
                    assert.equal(messages.length, 1);
                });
            });
        });
    });
});