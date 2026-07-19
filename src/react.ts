import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import {
  animateSlotText,
  clearSlotText,
  renderTextWithCssFallback,
  type SlotOptions,
} from "./slotText.js";

export interface SlotTextProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "dangerouslySetInnerHTML"
> {
  text: string;
  options?: SlotOptions;
}

export const SlotText = forwardRef<HTMLSpanElement, SlotTextProps>(
  ({ text, options, "aria-label": ariaLabel, ...props }, forwardedRef) => {
    const elementRef = useRef<HTMLSpanElement>(null);
    const mountedRef = useRef(false);
    const firstTextEffectRef = useRef(true);
    const optionsRef = useRef<SlotOptions | undefined>(options);
    const [initialText] = useState(text);

    useImperativeHandle(forwardedRef, () => elementRef.current!, []);

    useEffect(() => {
      optionsRef.current = options;
    }, [options]);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      renderTextWithCssFallback(element, text);
      mountedRef.current = true;

      return () => {
        clearSlotText(element);
        mountedRef.current = false;
        firstTextEffectRef.current = true;
      };
    }, []);

    useEffect(() => {
      const element = elementRef.current;
      if (!element || !mountedRef.current) return;
      if (firstTextEffectRef.current) {
        firstTextEffectRef.current = false;
        return;
      }

      animateSlotText(element, text, optionsRef.current);
    }, [text]);

    return createElement(
      "span",
      {
        ...props,
        "aria-label": ariaLabel ?? text,
        ref: elementRef,
      },
      initialText,
    );
  },
);

SlotText.displayName = "SlotText";
