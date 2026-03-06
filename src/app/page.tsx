import Link from "next/link";
import { auth } from "@/lib/auth";
import styles from "./landing.module.css";


export default async function Home() {
  const session = await auth();

  return (
    <main className={styles.landing}>
      <nav className={`${styles.landingNav} container`}>
        <div className={styles.logo}>WoodMart</div>
        <div className={styles.navLinks}>
          {session ? (
            <Link href="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>Login</Link>
              <Link href="/register" className="btn btn-primary">Join Now</Link>
            </>
          )}
        </div>
      </nav>

      <section className={`${styles.hero} container`}>
        <div className={styles.heroContent}>
          <h1>Premium Plywood & Hardware <span className={styles.textGradient}>Marketplace</span></h1>
          <p>The ultimate destination for shopkeepers, carpenters, and customers. Find materials, showcase skills, and build relationships.</p>
          <div className={styles.heroActions}>
            <Link href="/register" className="btn btn-primary btnLg">Get Started</Link>
            <Link href="/shops" className="btn btnOutline btnLg">Browse Shops</Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.glassBlob}></div>
        </div>
      </section>

      <section className={`${styles.features} container`}>
        <div className={styles.featureGrid}>
          <div className={`${styles.featureCard} glass-card`}>
            <h3>For Customers</h3>
            <p>Search plywood & hardware, compare prices, and hire top-rated carpenters.</p>
          </div>
          <div className={`${styles.featureCard} glass-card`}>
            <h3>For Shopkeepers</h3>
            <p>List your inventory, upload product videos, and reach thousands of customers.</p>
          </div>
          <div className={`${styles.featureCard} glass-card`}>
            <h3>For Carpenters</h3>
            <p>Showcase your portfolio, post videos of your work, and find your next job.</p>
          </div>
        </div>
      </section>

	
    </main>

  );
}
