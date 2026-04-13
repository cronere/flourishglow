import Head from 'next/head'
import Link from 'next/link'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import { posts } from '../../data/posts'
import styles from '../../styles/Blog.module.css'

export async function getStaticPaths() {
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const post = posts.find(p => p.slug === params.slug)
  const index = posts.findIndex(p => p.slug === params.slug)
  const related = posts.filter((_, i) => i !== index).slice(0, 2)
  return { props: { post, related } }
}

export default function BlogPost({ post, related }) {
  // Convert content to paragraphs and headings
  const renderContent = (content) => {
    return content.split('\n\n').map((block, i) => {
      if (block.startsWith('**') && block.endsWith('**')) {
        return <h3 key={i} className={styles.postH3}>{block.replace(/\*\*/g, '')}</h3>
      }
      // Handle inline bold
      const parts = block.split(/\*\*(.*?)\*\*/g)
      return (
        <p key={i} className={styles.postParagraph}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
        </p>
      )
    })
  }

  return (
    <>
      <Head>
        <title>{post.title} — FlourishGlow</title>
        <meta name="description" content={post.excerpt} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Nav />

      <div className={styles.postHero}>
        <div className={styles.postHeroInner}>
          <Link href="/blog" className={styles.backLink}>← All articles</Link>
          <div className={styles.postCategory} style={{marginTop:'16px'}}>{post.category}</div>
          <h1 className={styles.postHeroTitle}>{post.title}</h1>
          <div className={styles.postHeroMeta}>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>

      <div className={styles.postBody}>
        <div className={styles.postBodyInner}>
          <p className={styles.postLead}>{post.excerpt}</p>
          {renderContent(post.content)}
        </div>
      </div>

      {/* CTA */}
      <div className={styles.postCtaBox}>
        <div className={styles.postCtaInner}>
          <div className={styles.postCtaLabel}>Put this into practice</div>
          <h2 className={styles.postCtaTitle}>See what FlourishGlow would build for your practice.</h2>
          <p className={styles.postCtaDesc}>Request a free sample pack — real content built around your actual services, delivered to your inbox within 24 hours. No credit card required.</p>
          <a href="/#sample" className="btn-primary">Request a Free Sample Pack →</a>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className={styles.relatedSection}>
          <div className={styles.relatedInner}>
            <div className={styles.relatedLabel}>Keep reading</div>
            <div className={styles.relatedGrid}>
              {related.map(r => (
                <Link href={`/blog/${r.slug}`} key={r.slug} className={styles.relatedCard}>
                  <div className={styles.postCategory}>{r.category}</div>
                  <h3 className={styles.relatedTitle}>{r.title}</h3>
                  <p className={styles.relatedExcerpt}>{r.excerpt}</p>
                  <div className={styles.postCta}>Read article →</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
