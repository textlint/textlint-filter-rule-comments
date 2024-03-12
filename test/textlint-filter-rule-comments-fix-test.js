// LICENSE : MIT
"use strict";
import reportRule from "textlint-rule-report-node-types";
import { TextLintCore } from "@textlint/legacy-textlint-core"
import { ASTNodeTypes } from "@textlint/ast-node-types";
import assert from "assert";
import filterRule from "../src/textlint-filter-rule-comments";

describe("textlint-rule-ignore-node-types", function () {
    context("no options", function () {
        context("when before textlint-enable", function () {
            it("should not ignored", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({
                    report: reportRule
                }, {
                    report: {
                        nodeTypes: [ASTNodeTypes.Str]
                    }
                });
                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.fixText(`
This is Error.

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->

`, ".md").then(({ messages }) => {
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
                        nodeTypes: [ASTNodeTypes.Str]
                    }
                });
                
                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.fixText(`
<!-- textlint-disable -->

This is text.

<!-- textlint-enable -->
`, ".md").then(({ messages }) => {
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
                        nodeTypes: [ASTNodeTypes.Str]
                    }
                });
                
                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.fixText(`

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->

This is Error.
`, ".md").then(({ messages }) => {
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
                        nodeTypes: [ASTNodeTypes.Str]
                    }
                });
                
                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.fixText(`
<!-- textlint-disable ruleA -->

This is text.

<!-- textlint-enable ruleA -->
`, ".md").then(({ messages }) => {
                    assert.equal(messages.length, 0);
                });
            });
            it("should not ignore messages of other rules", function () {
                const textlint = new TextLintCore();
                textlint.setupRules({
                    ruleX: reportRule
                }, {
                    ruleX: {
                        nodeTypes: [ASTNodeTypes.Str]
                    }
                });
                
                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.fixText(`
<!-- textlint-disable ruleA -->

This is text.

<!-- textlint-enable -->
`, ".md").then(({ messages }) => {
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
                        nodeTypes: [ASTNodeTypes.Str]
                    },
                    ruleB: {
                        nodeTypes: [ASTNodeTypes.Str]
                    }
                });
                
                textlint.setupFilterRules({
                    filter: filterRule
                });
                return textlint.fixText(`

<!-- textlint-disable ruleA,ruleB -->

This is ignored. RuleA and RuleB

<!-- textlint-enable ruleA -->

This is Error of RuleA.

`, ".md").then(({ messages }) => {
                    assert.equal(messages.length, 1);
                });
            });
        });
    });
});
