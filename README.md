# rehype-sectionize

![test workflow](https://github.com/hbsnow/rehype-sectionize/actions/workflows/test.yml/badge.svg)
[![codecov](https://codecov.io/gh/hbsnow/rehype-sectionize/branch/main/graph/badge.svg?token=T3Z18P56LV)](https://codecov.io/gh/hbsnow/rehype-sectionize)

## Motivation

There is already [rehype-section][rehype-section] in the library for sectioning. But it could not change the class of section. In addition, sections could not have the slug of heading in the data attribute. I was referred [rehype-section][rehype-section]. Thanks.

## Install

```
npm i -D @hbsnow/rehype-sectionize
```

## Sample

### Input

```html
<h1 id="h1-id">h1</h1>
<h2 id="h2-id">h2</h2>
<h3 id="h3-id">h3</h3>
```

### Output

```html
<section class="heading" data-heading-rank="1" aria-labelledby="h1-id">
  <h1 id="h1-id">h1</h1>
  <section class="heading" data-heading-rank="2" aria-labelledby="h2-id">
    <h2 id="h2-id">h2</h2>
    <section class="heading" data-heading-rank="3" aria-labelledby="h3-id">
      <h3 id="h3-id">h3</h3>
    </section>
  </section>
</section>
```

## Options

| option              | type                    | default           | description                    |
| ------------------- | ----------------------- | ----------------- | ------------------------------ |
| `properties`        | `hastscript.Properties` | `{}`              | Attributes assigned to section |
| `enableRootSection` | `boolean`               | `false`           | Section to wrap all            |
| `rankPropertyName`  | `string`                | `dataHeadingRank` | Name of rank data attribute    |
| `idPropertyName`    | `string`                | `ariaLabelledby`  | Name of id data attribute      |

## License

[MIT][license] © [hbsnow][author]

[license]: license
[author]: https://hbsnow.dev
[rehype-section]: https://github.com/agentofuser/rehype-section
