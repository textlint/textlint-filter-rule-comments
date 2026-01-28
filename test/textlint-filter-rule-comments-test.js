// LICENSE : MIT
"use strict";
import { TextlintKernel } from "@textlint/kernel";
import { ASTNodeTypes } from "@textlint/ast-node-types";
import filterRule from "../src/textlint-filter-rule-comments";
import reportRule from "textlint-rule-report-node-types";
import markdownPlugin from "@textlint/textlint-plugin-markdown";
import assert from "assert";

describe("textlint-rule-ignore-node-types", function () {
    context("no options", function () {
        context("when before textlint-enable", function () {
            it("should not ignored", function () {
                const kernel = new TextlintKernel();

                return kernel
                    .lintText(
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
        context("when multi-line comments", function () {
            it("should be ignored", function () {
                const kernel = new TextlintKernel();

                return kernel
                    .lintText(
                        `
<!-- textlint-disable -->
<!-- This is comment -->

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
                        assert.equal(messages.length, 0);
                    });
            });
        });
        context("when during disable -- enable", function () {
            it("should messages is ignored between disable and enable", function () {
                const kernel = new TextlintKernel();
                return kernel
                    .lintText(
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
                    .lintText(
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
                    .lintText(
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
                    .lintText(
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
                    .lintText(
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

        context("description basics", function () {
            it("should ignore messages when using description in disable comment", function () {
                const kernel = new TextlintKernel();
                return kernel
                    .lintText(
                        `
<!-- textlint-disable ruleA -- temporary -->

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

            it("should ignore messages when disabling multiple rules with description", function () {
                const kernel = new TextlintKernel();
                return kernel
                    .lintText(
                        `
<!-- textlint-disable ruleA,ruleB -- temporary -->

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
                        assert.equal(messages.length, 0);
                    });
            });

            it("should re-enable ruleA when using description in enable comment", function () {
                const kernel = new TextlintKernel();
                return kernel
                    .lintText(
                        `
<!-- textlint-disable ruleA -->

This is text.

<!-- textlint-enable ruleA -- done -->

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
                        assert.equal(messages.length, 1);
                    });
            });

            it("should re-enable all when using description without rule ids in enable comment", function () {
                const kernel = new TextlintKernel();
                return kernel
                    .lintText(
                        `
<!-- textlint-disable -->

This is text.

<!-- textlint-enable -- done -->

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

        context("edge cases for comment descriptions with --", function () {
            it("should ignore messages when `--` appears before directive", function () {
                const kernel = new TextlintKernel();
                return kernel
                    .lintText(
                        `
<!-- -- textlint-disable ruleA -->

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
                        assert.equal(messages.length, 0);
                    });
            });

            it("should ignore messages when '---' follows directive", function () {
                const kernel = new TextlintKernel();
                return kernel
                    .lintText(
                        `
<!-- textlint-disable --- reason -->

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
                        assert.equal(messages.length, 0);
                    });
            });

            it("should ignore messages when '----' follows a rule id", function () {
                const kernel = new TextlintKernel();
                return kernel
                    .lintText(
                        `
<!-- textlint-disable ruleA ---- reason -->

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

            it("should ignore messages when multiple '--' are present", function () {
                const kernel = new TextlintKernel();
                return kernel
                    .lintText(
                        `
<!-- textlint-disable ruleA -- reason -- extra -->

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
        });
    });
});
