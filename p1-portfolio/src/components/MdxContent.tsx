import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

export default function MdxContent({ source }: { source: string }) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }] as any,
              [rehypePrettyCode, { theme: 'one-dark-pro' }] as any,
            ],
          },
        }}
      />
    </div>
  );
}
