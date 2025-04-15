# @text-middle-ellipsis/vue

A Vue.js composable that dynamically reacts to every HTML element's resize and trims provided string in the middle until it fits to element or until provided minimum length is reached.

- [Video Demo](https://github.com/user-attachments/assets/5296e059-ed9a-47a9-9a82-cabb6b1fe031)
- [StackBlitz Demo](https://stackblitz.com/edit/bolt-vue-ecuosg5z?file=src%2FApp.vue)


## Table of Contents

1. [Rationale](#rationale)
2. [Prerequisites and Dependencies](#prerequisites-and-dependencies)
3. [Installation and Usage](#installation-and-usage)
4. [How Does it Work](#how-does-it-work)
4. [Bugs, Questions, Feature Requests, Improvements](#bugs-questions-feature-requests-improvements)

## Rationale

There are cases when string of text is too large to fit its container and it would be nice if it could be shrinked by omitting characters in the middle, leaving beginning and the end of the string visible. Several solutions that solve the text overflow issue exist. The obvious one is CSS property `text-overflow`, but it only allows trim text from one end (not from the middle). Another approach is to copy text into two parts, then apply `text-overflow` to the end of the first part and to the beginning of the second part, then combine two parts. Although it sounds like perfect dynamic pure CSS solution, it unfortunately looks kind of wierd as the first part is trimmed by characters and the second part is trimmed by pixels. Also with this approach sometimes a whitespace gap is visible between the parts. There are also alternatives like `vue-text-middle-ellipsis`, but non of them are flexible enough in terms of configuration.

## Prerequisites and Dependencies

- Both [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) and [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) must be supported by a browser in which the app runs.
- `white-space: nowrap;` and other CSS styles could be required in order for the `@text-middle-ellipsis/vue` to work properly. They are intentionally omitted to give a developer control over the process.
- Theoretically any Vue version after 3.0 should work just fine, but it was only tested on Vue v3.5+.

## Installation and Usage

Add it to your project using package manager of your choice, for example, `npm`:

```shell
npm i --save-exact @text-middle-ellipsis/vue
```

Import and call `useTextMiddleEllipsis()` in your component, it will return `formattedText` which is of type `Ref<string>`, so it can be directly used as a value in a template.

```html
<template>
  <article ref="textArticle" class="text-article">{{ formattedText }}</article>
</template>
```

```typescript
// <script setup lang="ts">
import { useTextMiddleEllipsis } from '@text-middle-ellipsis/vue';
import { defineProps, useTemplateRef } from 'vue';

const props = defineProps<{ originalText: string }>();
const textArticle = useTemplateRef('textArticle'); // For Vue prior to v3.5, use `const textArticle = ref(null)`.
const { formattedText } = useTextMiddleEllipsis({ htmlElementRef: textArticle, text: props.originalText });
// </script>
```

```css
/* <style lang="css" scoped> */
.text-article {
  white-space: nowrap;
}
/* </style> */
```

`useTextMiddleEllipsis()` accepts an object of type `TextMiddleEllipsisParameters` as a parameter. It consists of the following properties:

| Name             | Type                                      | Default value | Required | Description |
| ---------------- | ----------------------------------------- | ------------- | -------- | ----------- |
| `htmlElementRef`   | Readonly<ShallowRef<HTMLElement \| null>> | ❌            | ✔️       | Ref to an HTML element for composable to observe. |
| `text`             | string                                    | ❌            | ✔️       | Original, not modified text to display. |
| `delimiter`        | string                                    | …             | ❌       | Character to place between left and right text parts when original text doesn't fit. Could be any string or even empty string. |
| `acceptableLength` | number                                    | 10            | ❌       | Length of text string below which string will not be shrinked. For example, if `acceptableLength` is `11`, the word `Chomolungma` will not be shrinked, but with `10` it will. |
| `trimStep`         | number                                    | 1             | ❌       | Number of characters by which to pinch off characters from the text middle. The default value of `1` should be ok for most cases, but you never know. :) |

## How Does it Work

1. During component's `onMounted()` [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) and [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) are set to observe HTML element provided as a parameter.
2. Every time viewport size changes the ResizeObserver performs increasing/decreasing step, depending on whether viewport become smaller and formatted text doesn't fit again or viewport become larger and there is space to show more characters.
3. Every increasing/decreasing step triggers MutationObserver, which performs another increasing/decreasing step.
4. Decreasing steps stop when formatted text fits its container or when minimum possible size is reached, which is when either left or right part's length is eqal or less than provided trim step.
5. Increasing steps stop when formatted text is restored back to original text or when text is restored to the point it doesn't fit to its container again. In case of latter, one final decreasing step is performed and process is completed until the next viewport size change.

## Bugs, Questions, Feature Requests, Improvements

Please fill free to use [GitHub Issues Page](https://github.com/Kolobamanacas/text-middle-ellipsis-vue/issues) for any type of feedback. If you have ideas for improvements, pull requests are also welcome.
