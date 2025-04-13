import { type Ref, type ShallowRef, onMounted, onUnmounted, ref } from 'vue';

export type TextMiddleEllipsisParameters = {
  htmlElementRef: Readonly<ShallowRef<HTMLElement | null>>;
  text: string;
  delimiter?: string;
  acceptableLength?: number;
  trimStep?: number;
};

export const useTextMiddleEllipsis = ({
  htmlElementRef,
  text,
  delimiter = '…',
  acceptableLength = 10,
  trimStep = 1,
}: TextMiddleEllipsisParameters): { formattedText: Ref<string> } => {
  const formattedText: Ref<string> = ref(text);

  let resizeObserver: ResizeObserver | undefined;
  let mutationObserver: MutationObserver | undefined;
  let leftText = text.slice(0, Math.trunc(text.length / 2));
  let rightText = text.slice(Math.trunc(text.length / 2));
  let currentWidth = Number(htmlElementRef.value?.offsetWidth ?? 0);
  let isDecreasing = true;

  const isTextLengthAcceptable = () => {
    return text.length <= acceptableLength;
  };

  const isOverflow = () => {
    if (htmlElementRef.value === null) {
      return false;
    }

    return htmlElementRef.value.offsetWidth < htmlElementRef.value.scrollWidth;
  };

  const isMinimalWidthReached = () => {
    return leftText.length <= trimStep || rightText.length <= trimStep;
  };

  const handleDecrease = () => {
    if (isMinimalWidthReached()) {
      leftText = leftText.slice(0, trimStep);
      rightText = rightText.slice(-trimStep);
    } else {
      leftText = leftText.slice(0, leftText.length - trimStep);
      rightText = rightText.slice(-(rightText.length - trimStep));
    }

    formattedText.value = leftText + delimiter + rightText;
  };

  const handleIncrease = () => {
    if (formattedText.value === text) {
      return;
    }

    if (leftText.length + rightText.length + trimStep * 2 >= text.length) {
      formattedText.value = text;

      return;
    }

    leftText += text.slice(leftText.length, leftText.length + trimStep);
    rightText = text.slice(-trimStep - rightText.length);
    formattedText.value = leftText + delimiter + rightText;
  };

  onMounted(() => {
    if (htmlElementRef.value === null || isTextLengthAcceptable()) {
      return;
    }

    resizeObserver = new ResizeObserver(() => {
      if (htmlElementRef.value === null || htmlElementRef.value.offsetWidth === currentWidth) {
        return;
      }

      isDecreasing = htmlElementRef.value.offsetWidth < currentWidth;
      currentWidth = htmlElementRef.value.offsetWidth;

      if (isOverflow()) {
        isDecreasing = true;
        handleDecrease();

        return;
      }

      if (!isDecreasing) {
        handleIncrease();
      }
    });

    resizeObserver.observe(htmlElementRef.value);

    mutationObserver = new MutationObserver(() => {
      if (isOverflow()) {
        isDecreasing = true;
        handleDecrease();

        return;
      }

      if (!isDecreasing) {
        handleIncrease();
      }
    });

    mutationObserver.observe(htmlElementRef.value, { childList: true });
  });

  onUnmounted(() => {
    if (isTextLengthAcceptable()) {
      return;
    }

    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
  });

  return { formattedText };
};
