/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import styles from '@/styles/Profile.module.css'; // Using shared CSS

export default function Marketplace() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/sign-in');
      } else {
        setUser(data.user);
        fetchProducts();
      }
    };

    checkUser();
  }, [router]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('marketplace').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className={styles.pageContainer}>
      <Sidebar onToggle={(open: boolean) => console.log('Sidebar toggled', open)} />
      <div className={styles.contentContainer}>
        <main className={styles.mainContent}>
          <h1>Marketplace</h1>
          <p>Buy and sell items with the student community.</p>

          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products available yet.</p>
          ) : (
            <div className={styles.marketplaceGrid}>
              {products.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <img src={product.image_url} alt={product.name} className={styles.productImage} />
                  <h3>{product.name}</h3>
                  <p className={styles.productPrice}>${product.price}</p>
                  <button className={styles.actionButton} onClick={() => router.push(`/marketplace/${product.id}`)}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
        <div className={styles.footerContainer}>
          <Footer />
        </div>
      </div>
    </div>
  );
}