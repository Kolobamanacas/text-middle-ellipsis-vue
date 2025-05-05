import { type ComputedRef, type Ref, type ShallowRef, computed, onMounted, onUnmounted, ref } from 'vue';

export type TextMiddleEllipsisParameters = {
  htmlElementRef: Readonly<ShallowRef<HTMLElement | null>>;
  text: string | Ref<string>;
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
  const originalText: ComputedRef<string> = computed<string>(() => {
    return typeof text === 'string' ? text : text.value;
  });
  const formattedText: Ref<string> = ref(originalText.value);

  let resizeObserver: ResizeObserver | undefined;
  let mutationObserver: MutationObserver | undefined;
  let leftText = originalText.value.slice(0, Math.trunc(originalText.value.length / 2));
  let rightText = originalText.value.slice(Math.trunc(originalText.value.length / 2));
  let currentWidth = Number(htmlElementRef.value?.offsetWidth ?? 0);
  let isDecreasing = true;

  const isTextLengthAcceptable = () => {
    return originalText.value.length <= acceptableLength;
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
    if (formattedText.value === originalText.value) {
      return;
    }

    if (leftText.length + rightText.length + trimStep * 2 >= originalText.value.length) {
      formattedText.value = originalText.value;

      return;
    }

    leftText += originalText.value.slice(leftText.length, leftText.length + trimStep);
    rightText = originalText.value.slice(-trimStep - rightText.length);
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
