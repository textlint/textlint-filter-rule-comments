// LICENSE : MIT
"use strict";
import StatusManager from "./StatusManager";
import {
    parseRuleIds,
    getValuesFromHTMLComment,
    isHTMLComment,
    removeCommentDescription,
} from "./parse-comment";
import { createRequire } from "module";

// Store expectations per filePath/content during parsing so we can verify them after linting
const _expectationStore = new Map();

function getExpectationStore(filePath) {
    const key = typeof filePath === "string" ? filePath : "";
    if (!_expectationStore.has(key)) {
        _expectationStore.set(key, new Map());
    }
    return _expectationStore.get(key);
}

function collectExpectationTargetNodes(root, Syntax, getSource) {
    const nodes = [];
    const visit = (node) => {
        if (!node || !node.type) {
            return;
        }
        if (node.type === Syntax.Document) {
            if (Array.isArray(node.children)) {
                node.children.forEach(visit);
            }
            return;
        }
        if (node.type === Syntax.Comment) {
            return;
        }
        if (node.type === Syntax.Html) {
            const value = getSource(node);
            if (isHTMLComment(value)) {
                return;
            }
        }
        nodes.push(node);
        if (Array.isArray(node.children)) {
            node.children.forEach(visit);
        }
    };
    visit(root);
    return nodes;
}

const defaultOptions = {
    // enable comment directive
    // if comment has the value, then enable textlint rule
    enablingComment: "textlint-enable",
    // disable comment directive
    // if comment has the value, then disable textlint rule
    disablingComment: "textlint-disable",
    // expect error directive
    // if comment has the value, then expectation for textlint rule
    expectingComment: "textlint-expect-error",
};
module.exports = function (context, options = defaultOptions) {
    const { Syntax, shouldIgnore, getSource, getFilePath } = context;

    const enablingComment =
        options.enablingComment || defaultOptions.enablingComment;
    const disablingComment =
        options.disablingComment || defaultOptions.disablingComment;
    const expectingComment =
        options.expectingComment || defaultOptions.expectingComment;

    const content = getSource();
    const filePath = getFilePath ? getFilePath() : undefined;
    const statusManager = new StatusManager(content.length);
    // Get comment value
    const documentExitKey = Syntax.DocumentExit || `${Syntax.Document}:exit`;
    return {
        /*

This is wrong format.
https://github.com/wooorm/remark treat as one html block.

<!-- textlint-disable -->
This is ignored.
<!-- textlint-enable -->

should be

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->
         */
        [Syntax.Html](node) {
            const nodeValue = getSource(node);
            if (!isHTMLComment(nodeValue)) {
                return;
            }
            const comments = getValuesFromHTMLComment(nodeValue);
            comments.forEach((commentValue) => {
                if (commentValue.indexOf(enablingComment) !== -1) {
                    const configValue = removeCommentDescription(
                        commentValue.replace(enablingComment, ""),
                    );
                    statusManager.enableReporting(
                        node,
                        parseRuleIds(configValue),
                    );
                } else if (commentValue.indexOf(disablingComment) !== -1) {
                    const configValue = removeCommentDescription(
                        commentValue.replace(disablingComment, ""),
                    );
                    statusManager.disableReporting(
                        node,
                        parseRuleIds(configValue),
                    );
                } else if (commentValue.indexOf(expectingComment) !== -1) {
                    const configValue = removeCommentDescription(
                        commentValue.replace(expectingComment, ""),
                    );
                    statusManager.expectError(node, parseRuleIds(configValue));
                }
            });
        },
        [Syntax.Comment](node) {
            const commentValue = node.value || "";
            if (commentValue.indexOf(enablingComment) !== -1) {
                const configValue = removeCommentDescription(
                    commentValue.replace(enablingComment, ""),
                );
                statusManager.enableReporting(node, parseRuleIds(configValue));
            } else if (commentValue.indexOf(disablingComment) !== -1) {
                const configValue = removeCommentDescription(
                    commentValue.replace(disablingComment, ""),
                );
                statusManager.disableReporting(node, parseRuleIds(configValue));
            } else if (commentValue.indexOf(expectingComment) !== -1) {
                const configValue = removeCommentDescription(
                    commentValue.replace(expectingComment, ""),
                );
                statusManager.expectError(node, parseRuleIds(configValue));
            }
        },
        [documentExitKey](node) {
            const ignoringMessages = statusManager.getIgnoringMessages();
            ignoringMessages.forEach((message) => {
                const range = [message.startIndex, message.endIndex];
                shouldIgnore(range, {
                    ruleId: message.ruleId || "*",
                });
            });
            // Save expectations recorded by this filter so they can be verified after linting
            const targets = collectExpectationTargetNodes(
                node,
                Syntax,
                getSource,
            );
            statusManager.resolveExpectations(targets);
            const expectations = statusManager.getExpectations();
            const store = getExpectationStore(filePath);
            store.set(content, expectations);
        },
    };
};

// Verify expectations collected during parsing, suppress matched messages, and
// emit expect-error diagnostics when expectations are unmet.
export function verifyExpectations(messages, content, filePath) {
    const store = getExpectationStore(filePath);
    const expectations = store.get(content) || [];
    store.delete(content);

    function getIndex(msg) {
        if (typeof msg.index === "number") {
            return msg.index;
        }
        if (msg.range && Array.isArray(msg.range)) {
            return msg.range[0];
        }
        if (typeof msg.line === "number") {
            const lines = content.split(/\r\n|\n/);
            let idx = 0;
            for (let i = 0; i < msg.line - 1; i++) {
                idx += lines[i].length + 1;
            }
            idx += msg.column ? msg.column - 1 : 0;
            return idx;
        }
        return -1;
    }

    function indexToLineColumn(index) {
        const lines = content.split(/\r\n|\n/);
        let pos = 0;
        for (let i = 0; i < lines.length; i++) {
            const lineLen = lines[i].length + 1;
            if (pos + lineLen > index) {
                return { line: i + 1, column: index - pos + 1 };
            }
            pos += lineLen;
        }
        return {
            line: lines.length,
            column: lines[lines.length - 1].length + 1,
        };
    }

    const consumed = new Set();

    expectations.forEach((expectation) => {
        const start = expectation.startIndex;
        const end = expectation.endIndex;
        const targetRule = expectation.ruleId;

        let matched = null;
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (consumed.has(msg)) {
                continue;
            }
            const idx = getIndex(msg);
            if (idx < 0) {
                continue;
            }
            if (idx < start || idx >= end) {
                continue;
            }
            if (!targetRule || msg.ruleId === targetRule) {
                matched = msg;
                break;
            }
        }

        if (matched) {
            consumed.add(matched);
            return;
        }

        const text = targetRule
            ? `Expected error for "${targetRule}" but none found in the expected range.`
            : `Expected at least one error but none found in the expected range.`;
        const loc = indexToLineColumn(start);
        messages.push({
            ruleId: "textlint-expect-error",
            message: text,
            index: start,
            line: loc.line,
            column: loc.column,
        });
    });

    return messages.filter((m) => !consumed.has(m));
}

// TODO: Replace this monkey-patch.
export function postProcess(messages, context) {
    const text =
        context && typeof context.text === "string" ? context.text : "";
    const filePath = context && context.filePath;
    return verifyExpectations(messages, text, filePath);
}

function resolveKernelInput(args, result) {
    let text = "";
    let filePath;
    if (result && typeof result.filePath === "string") {
        filePath = result.filePath;
    }
    if (typeof args[0] === "string") {
        text = args[0];
    } else if (args[0] && typeof args[0] === "object") {
        if (typeof args[0].text === "string") {
            text = args[0].text;
        }
        if (!filePath && typeof args[0].filePath === "string") {
            filePath = args[0].filePath;
        }
    }
    if (!filePath && args[1] && typeof args[1].filePath === "string") {
        filePath = args[1].filePath;
    }
    return { text, filePath };
}
const requireFromCwd = createRequire(process.cwd() + "/");
const dynamicImport = new Function("specifier", "return import(specifier)");
const importKernel = () => {
    try {
        const kernelPath = requireFromCwd.resolve("@textlint/kernel");
        return dynamicImport(kernelPath);
    } catch (e) {
        return dynamicImport("@textlint/kernel");
    }
};

(async () => {
    try {
        const kernel = await importKernel();
        const TextlintKernel =
            kernel &&
            (kernel.TextlintKernel ||
                (kernel.default && kernel.default.TextlintKernel) ||
                kernel.default);
        if (!TextlintKernel || !TextlintKernel.prototype) {
            throw new Error("TextlintKernel not available");
        }
        if (!TextlintKernel.prototype.__textlint_filter_expect_patch__) {
            const patch = (methodName) => {
                const orig = TextlintKernel.prototype[methodName];
                if (typeof orig !== "function") {
                    return;
                }
                TextlintKernel.prototype[methodName] = function (...args) {
                    return Promise.resolve(orig.apply(this, args)).then(
                        (result) => {
                            if (
                                result &&
                                result.messages &&
                                typeof postProcess === "function"
                            ) {
                                const { text, filePath } = resolveKernelInput(
                                    args,
                                    result,
                                );
                                result.messages = postProcess(result.messages, {
                                    text,
                                    filePath,
                                });
                            }
                            return result;
                        },
                    );
                };
            };
            patch("lintText");
            patch("fixText");
            TextlintKernel.prototype.__textlint_filter_expect_patch__ = true;
        }
    } catch (e) {
        // Ignore if kernel is unavailable or patching is not possible in this environment.
    }
})();
