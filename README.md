# textlint-rule-ignore-comments [![Build Status](https://travis-ci.org/textlint/textlint-rule-ignore-comment.svg?branch=master)](https://travis-ci.org/textlint/textlint-rule-ignore-comment)

textlint rule that ignore texts using comments directive.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install textlint-rule-ignore-comments

Dependencies:

- [textlint](http://textlint.github.io/ "textlint") >= 6.8

## Usage

### Ignore error messages using comments

Example case in Markdown.

```markdown
This is error text.

<!-- textlint-disable -->

This is ignored text by rule.
Disables all rules between comments

<!-- textlint-enable -->

This is error text.
```

Ignore specified rules:

```markdown
<!-- textlint-disable ruleA,ruleB -->

Ignore RuleA and RuleB

<!-- textlint-enable ruleA -->

Still ignore RuleB
```

**Limitation(markdown)**:

Require new-line around of `<!-- textlint-disable -->` in Markdown.
This limitation com from [remark](https://github.com/wooorm/remark "remark").

NG:

```markdown
<!-- textlint-disable -->
this is wrong
<!-- textlint-enable -->
```

OK:

```markdown
<!-- textlint-disable -->

this is ok

<!-- textlint-enable -->
```

### Settings

Via `.textlintrc`(Recommended)


```json
{
    "rules": {
        "ignore-comments": true
    }
}
```

Via CLI

```
textlint --rule ignore-comments README.md
```

### Options

- `enablingComment`:
    - default: `"textlint-enable"` 
    - enable comment directive
    - e.g.) `<!-- textlint-enable -->`
- `disablingComment`:
    - default: `"textlint-disable"` 
    - disable comment directive
    - e.g.) `<!-- textlint-disable -->`

```js
{
    "rules": {
        "ignore-comments": {
            // enable comment directive
            // if comment has the value, then enable textlint rule
            "enablingComment": "textlint-enable",
            // disable comment directive
            // if comment has the value, then disable textlint rule
           "disablingComment": "textlint-disable"
        }
    }
}
```



## Changelog

See [Releases page](https://github.com/textlint/textlint-rule-ignore-comments/releases).

## Acknowledgement

- [Documentation - ESLint - Pluggable JavaScript linter](http://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments "Documentation - ESLint - Pluggable JavaScript linter")

## Running tests

Install devDependencies and Run `npm test`:

    npm i -d && npm test

## Contributing

Pull requests and stars are always welcome.
For bugs and feature requests, [please create an issue](https://github.com/textlint/textlint-rule-ignore-comments/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](http://twitter.com/azu_re)

## License

MIT © azu
