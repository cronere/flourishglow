import Head from 'next/head'
import Link from 'next/link'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import { posts } from '../../data/posts'
import styles from '../../styles/Blog.module.css'

export default function Blog() {
  return (
    <>
      <Head>
        <title>Blog — FlourishGlow</title>
        <meta name="description" content="Marketing insights and strategies for wellness practices. Learn how to stay visible, retain patients, and grow your practice without spending hours on content." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Nav />

      <div className={styles.blogHero}>
        <div className={styles.blogHeroInner}>
          <div className={styles.blogEyebrow}>The FlourishGlow Blog</div>
          <h1>Marketing that works<br />for <em>wellness practices.</em></h1>
          <p>Practical insights on staying visible, retaining patients, and growing your practice — without becoming a content creator.</p>
        </div>
      </div>

      <div className={styles.blogGrid}>
        <div className={styles.blogGridInner}>
          {posts.map(post => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className={styles.postCard}>
              <div className={styles.postCategory}>{post.category}</div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postExcerpt}>{post.excerpt}</p>
              <div className={styles.postMeta}>
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
              <div className={styles.postCta}>Read article →</div>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.blogCtaSection}>
        <div className={styles.blogCtaInner}>
          <h2>Ready to put this into practice?</h2>
          <p>FlourishGlow handles all of this for your practice — every month, automatically. Request a free sample pack built around your actual services.</p>
          <a href="/#sample" className="btn-primary">Request a Free Sample Pack</a>
        </div>
      </div>

      <Footer />
    </>
  )
}
