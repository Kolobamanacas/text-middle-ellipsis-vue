import { type ComputedRef, type Ref, type ShallowRef, computed, onMounted, onUnmounted, ref, watch } from 'vue';

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

  const computeTextPart = (part: 'left' | 'right') => {
    return part === 'left'
      ? originalText.value.slice(0, Math.trunc(originalText.value.length / 2))
      : originalText.value.slice(Math.trunc(originalText.value.length / 2));
  };

  let resizeObserver: ResizeObserver | undefined;
  let mutationObserver: MutationObserver | undefined;
  let leftText = computeTextPart('left');
  let rightText = computeTextPart('right');
  let currentWidth = Number(htmlElementRef.value?.offsetWidth ?? 0);
  let isDecreasing = true;

  const isTextLengthAcceptable = () => {
    return originalText.value.length <= acceptableLength;
  };

  const isOverflow = () => {
    if (htmlElementRef.value === null) {
      return false;
    }

    return !isTextLengthAcceptable() && htmlElementRef.value.offsetWidth < htmlElementRef.value.scrollWidth;
  };

  const isMinimalWidthReached = () => {
    return isTextLengthAcceptable() || leftText.length <= trimStep || rightText.length <= trimStep;
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

  const handleResize = () => {
    if (isOverflow()) {
      isDecreasing = true;
      handleDecrease();

      return;
    }

    if (!isDecreasing) {
      handleIncrease();
    }
  };

  watch(originalText, (val) => {
    formattedText.value = val;
    leftText = computeTextPart('left');
    rightText = computeTextPart('right');
  });

  onMounted(() => {
    if (htmlElementRef.value === null) {
      return;
    }

    resizeObserver = new ResizeObserver(() => {
      if (htmlElementRef.value === null || htmlElementRef.value.offsetWidth === currentWidth) {
        return;
      }

      isDecreasing = htmlElementRef.value.offsetWidth < currentWidth;
      currentWidth = htmlElementRef.value.offsetWidth;
      handleResize();
    });

    resizeObserver.observe(htmlElementRef.value);
    mutationObserver = new MutationObserver(handleResize);
    mutationObserver.observe(htmlElementRef.value, { childList: true });
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
  });

  return { formattedText };
};
