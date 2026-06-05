import { buildHeadDescriptors } from '@dropinblog/react-core/server';
import type { HeadDescriptor } from '@dropinblog/react-core/server';
import type {
  HeadOptions,
  HeadOptionsProps,
  TanStackLinkDescriptor,
  TanStackMetaDescriptor,
  TanStackScriptDescriptor,
  TanStackStyleDescriptor,
} from './types';

const BOOLEAN_SCRIPT_ATTRS = new Set(['async', 'defer', 'nomodule']);

function coerceBoolean(value: string): boolean {
  return value !== 'false';
}

/**
 * Converts a rendered DropInBlog response into the object shape expected by a
 * TanStack Router route `head()` function:
 *   { title, meta, links, styles, scripts }
 *
 * Meta and link attributes are passed through largely untouched (TanStack renders
 * them straight onto the element), which is less lossy than the Next.js adapter's
 * mapping onto a fixed `Metadata` object. `<HeadContent />` renders the meta,
 * link, style and title tags; `<Scripts />` renders the scripts.
 */
export function getHeadOptions(props: HeadOptionsProps): HeadOptions {
  const { data } = props;
  const descriptors = buildHeadDescriptors(data.head_data, data.head_items);

  let title: string | undefined;
  const meta: TanStackMetaDescriptor[] = [];
  const links: TanStackLinkDescriptor[] = [];
  const styles: TanStackStyleDescriptor[] = [];
  const scripts: TanStackScriptDescriptor[] = [];

  descriptors.forEach((descriptor: HeadDescriptor) => {
    const tag = descriptor.tag.toLowerCase();
    const attributes = descriptor.attributes ?? {};

    if (tag === 'title' && descriptor.content) {
      // Emit the title as a meta entry (`{ title }`) rather than a top-level
      // `head.title`. TanStack dedupes title meta entries across nested routes
      // (last one wins), so this correctly overrides a title set in __root.tsx.
      // A top-level `title` does not dedupe against a parent's meta title.
      title = descriptor.content;
      return;
    }

    if (tag === 'meta') {
      meta.push({ ...attributes });
      return;
    }

    if (tag === 'link') {
      links.push({ ...attributes });
      return;
    }

    if (tag === 'style' && descriptor.content !== undefined) {
      const { media, ...rest } = attributes;
      styles.push({ children: descriptor.content, media, ...rest });
      return;
    }

    if (tag === 'script') {
      // Inline scripts (json-ld, etc.) carry their payload as content.
      if (descriptor.content !== undefined && !attributes.src) {
        const { type, ...rest } = attributes;
        scripts.push({ children: descriptor.content, type, ...rest });
        return;
      }

      // External scripts (e.g. proxy.js) carry a src; coerce boolean attributes.
      if (attributes.src) {
        const script: TanStackScriptDescriptor = {};
        Object.entries(attributes).forEach(([key, value]) => {
          if (BOOLEAN_SCRIPT_ATTRS.has(key)) {
            script[key] = coerceBoolean(value);
          } else {
            script[key] = value;
          }
        });
        scripts.push(script);
      }
    }
  });

  const result: HeadOptions = {};
  if (title) {
    meta.unshift({ title });
  }
  if (meta.length) {
    result.meta = meta;
  }
  if (links.length) {
    result.links = links;
  }
  if (styles.length) {
    result.styles = styles;
  }
  if (scripts.length) {
    result.scripts = scripts;
  }
  return result;
}
