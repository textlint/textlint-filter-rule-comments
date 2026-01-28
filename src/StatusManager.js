// LICENSE : MIT
"use strict";
export default class StatusManager {
    constructor(endIndex) {
        /**
         * @typedef {Object} IgnoringCommentObject
         * @property {number|null} startIndex
         * @property {number|null} endIndex
         * @property {string|null} ruleId
         */
        /**
         * @type {IgnoringCommentObject[]}
         */
        this.reportingConfig = [];

        /* Resolved expectations for verification after linting.**/
        this.expectations = [];

        /* Pending expectations waiting to be bound to the next node.**/
        this.pendingExpectations = [];

        /**
         * @type {TxtNode}
         */
        this.endIndex = endIndex;
    }

    getIgnoringMessages() {
        return this.reportingConfig.map((reporting) => {
            if (reporting.endIndex === null) {
                // [start, ?= document-end]
                // filled with document's end
                reporting.endIndex = this.endIndex;
            }
            return reporting;
        });
    }

    /**
     * Add data to reporting configuration to disable reporting for list of rules
     * starting from start location
     * @param  {Object} startNode Node to start
     * @param  {string[]} rulesToDisable List of rules
     * @returns {void}
     */
    disableReporting(startNode, rulesToDisable) {
        const reportingConfig = this.reportingConfig;
        if (rulesToDisable.length) {
            rulesToDisable.forEach(function (ruleId) {
                reportingConfig.push({
                    startIndex: startNode.range[0],
                    endIndex: null,
                    ruleId: ruleId,
                });
            });
        } else {
            reportingConfig.push({
                startIndex: startNode.range[0],
                endIndex: null,
                ruleId: null,
            });
        }
    }

    getExpectations() {
        return this.expectations;
    }

    /**
     * Add expectation for errors for list of rules starting from start location
     * @param {Object} startNode Node to start
     * @param {string[]} rulesToExpect List of rules
     * @returns {void}
     */
    expectError(startNode, rulesToExpect) {
        const pending = this.pendingExpectations;
        const commentEndIndex = startNode.range[1];
        if (rulesToExpect.length) {
            rulesToExpect.forEach(function (ruleId) {
                pending.push({
                    commentEndIndex,
                    ruleId: ruleId,
                });
            });
        } else {
            pending.push({
                commentEndIndex,
                ruleId: null,
            });
        }
    }

    /**
     * Resolve pending expectations as "expect error in next node" ranges.
     * @param {Array<{ range: number[] }>} nodes Document-order nodes excluding comment nodes
     * @returns {void}
     */
    resolveExpectations(nodes) {
        const resolved = [];
        this.pendingExpectations.forEach((pending) => {
            const nextNode = nodes.find((node) => {
                if (!node || !node.range) {
                    return false;
                }
                return node.range[0] >= pending.commentEndIndex;
            });
            if (nextNode && nextNode.range) {
                resolved.push({
                    startIndex: nextNode.range[0],
                    endIndex: nextNode.range[1],
                    ruleId: pending.ruleId,
                });
            } else {
                resolved.push({
                    startIndex: this.endIndex,
                    endIndex: this.endIndex,
                    ruleId: pending.ruleId,
                });
            }
        });
        this.expectations = resolved;
        this.pendingExpectations = [];
    }

    /**
     * Add data to reporting configuration to enable reporting for list of rules
     * starting from start location
     * @param  {Object} startNode Node to start
     * @param  {string[]} rulesToEnable List of rules
     * @returns {void}
     */
    enableReporting(startNode, rulesToEnable) {
        var i;
        const endIndex = startNode.range[0];
        const reportingConfig = this.reportingConfig;
        if (rulesToEnable.length) {
            rulesToEnable.forEach(function (ruleId) {
                for (i = reportingConfig.length - 1; i >= 0; i--) {
                    if (
                        !reportingConfig[i].endIndex &&
                        reportingConfig[i].ruleId === ruleId
                    ) {
                        reportingConfig[i].endIndex = endIndex;
                        break;
                    }
                }
            });
        } else {
            // find all previous disabled locations if they was started as list of rules
            var prevStart;

            for (i = reportingConfig.length - 1; i >= 0; i--) {
                if (prevStart && prevStart !== reportingConfig[i].start) {
                    break;
                }

                if (!reportingConfig[i].endIndex) {
                    reportingConfig[i].endIndex = endIndex;
                    prevStart = reportingConfig[i].start;
                }
            }
        }
    }
}
