// LICENSE : MIT
"use strict";
import reportRule from "textlint-rule-report-node-types";
import { TextlintKernel } from "@textlint/kernel";
import { ASTNodeTypes } from "@textlint/ast-node-types";
import markdownPlugin from "@textlint/textlint-plugin-markdown";
import assert from "assert";
import filterRule from "../src/textlint-filter-rule-comments";

describe("textlint-rule-ignore-node-types", function () {
    context("no options", function () {
        context("when before textlint-enable", function () {
            it("should not ignored", function () {
                const kernel = new TextlintKernel();

                return kernel
                    .fixText(
                        `
This is Error.

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->

`,
                        {
                            filePath: "input.md",
                            ext: ".md",
                            plugins: [
                                {
                                    pluginId: "markdown",
                                    plugin: markdownPlugin,
                                },
                            ],
                            rules: [
                                {
                                    ruleId: "report",
                                    rule: reportRule,
                                    options: { nodeTypes: [ASTNodeTypes.Str] },
                                },
                            ],
                            filterRules: [
                                { ruleId: "filter", rule: filterRule },
                            ],
                        },
                    )
                    .then(({ messages }) => {
                        assert.equal(messages.length, 1);
                    });
            });
        });
        context("when during disable -- enable", function () {
            it("should messages is ignored between disable and enable", function () {
                const kernel = new TextlintKernel();

                return kernel
                    .fixText(
                        `
<!-- textlint-disable -->

This is text.

<!-- textlint-enable -->
`,
                        {
                            filePath: "input.md",
                            ext: ".md",
                            plugins: [
                                {
                                    pluginId: "markdown",
                                    plugin: markdownPlugin,
                                },
                            ],
                            rules: [
                                {
                                    ruleId: "report",
                                    rule: reportRule,
                                    options: { nodeTypes: [ASTNodeTypes.Str] },
                                },
                            ],
                            filterRules: [
                                { ruleId: "filter", rule: filterRule },
                            ],
                        },
                    )
                    .then(({ messages }) => {
                        assert.equal(messages.length, 0);
                    });
            });
        });
        context("when after textlint-enable", function () {
            it("should not ignored", function () {
                const kernel = new TextlintKernel();

                return kernel
                    .fixText(
                        `

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->

This is Error.
`,
                        {
                            filePath: "input.md",
                            ext: ".md",
                            plugins: [
                                {
                                    pluginId: "markdown",
                                    plugin: markdownPlugin,
                                },
                            ],
                            rules: [
                                {
                                    ruleId: "report",
                                    rule: reportRule,
                                    options: { nodeTypes: [ASTNodeTypes.Str] },
                                },
                            ],
                            filterRules: [
                                { ruleId: "filter", rule: filterRule },
                            ],
                        },
                    )
                    .then(({ messages }) => {
                        assert.equal(messages.length, 1);
                    });
            });
        });
    });
    context("with ruleId options", function () {
        context("when disable <ruleA>", function () {
            it("should ignore messages of ruleA", function () {
                const kernel = new TextlintKernel();

                return kernel
                    .fixText(
                        `
<!-- textlint-disable ruleA -->

This is text.

<!-- textlint-enable ruleA -->
`,
                        {
                            filePath: "input.md",
                            ext: ".md",
                            plugins: [
                                {
                                    pluginId: "markdown",
                                    plugin: markdownPlugin,
                                },
                            ],
                            rules: [
                                {
                                    ruleId: "ruleA",
                                    rule: reportRule,
                                    options: { nodeTypes: [ASTNodeTypes.Str] },
                                },
                            ],
                            filterRules: [
                                { ruleId: "filter", rule: filterRule },
                            ],
                        },
                    )
                    .then(({ messages }) => {
                        assert.equal(messages.length, 0);
                    });
            });
            it("should not ignore messages of other rules", function () {
                const kernel = new TextlintKernel();

                return kernel
                    .fixText(
                        `
<!-- textlint-disable ruleA -->

This is text.

<!-- textlint-enable -->
`,
                        {
                            filePath: "input.md",
                            ext: ".md",
                            plugins: [
                                {
                                    pluginId: "markdown",
                                    plugin: markdownPlugin,
                                },
                            ],
                            rules: [
                                {
                                    ruleId: "ruleX",
                                    rule: reportRule,
                                    options: { nodeTypes: [ASTNodeTypes.Str] },
                                },
                            ],
                            filterRules: [
                                { ruleId: "filter", rule: filterRule },
                            ],
                        },
                    )
                    .then(({ messages }) => {
                        assert.equal(messages.length, 1);
                    });
            });
        });
        context("after textlint-enable <ruleA>", function () {
            it("should ignore messages of ruleA", function () {
                const kernel = new TextlintKernel();

                return kernel
                    .fixText(
                        `

<!-- textlint-disable ruleA,ruleB -->

This is ignored. RuleA and RuleB

<!-- textlint-enable ruleA -->

This is Error of RuleA.

`,
                        {
                            filePath: "input.md",
                            ext: ".md",
                            plugins: [
                                {
                                    pluginId: "markdown",
                                    plugin: markdownPlugin,
                                },
                            ],
                            rules: [
                                {
                                    ruleId: "ruleA",
                                    rule: reportRule,
                                    options: { nodeTypes: [ASTNodeTypes.Str] },
                                },
                                {
                                    ruleId: "ruleB",
                                    rule: reportRule,
                                    options: { nodeTypes: [ASTNodeTypes.Str] },
                                },
                            ],
                            filterRules: [
                                { ruleId: "filter", rule: filterRule },
                            ],
                        },
                    )
                    .then(({ messages }) => {
                        assert.equal(messages.length, 1);
                    });
            });
        });
    });
});
