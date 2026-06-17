import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { statConfig } from '../../utils/constents';
import { SectionHeading } from '../../components/common/sectionHeading';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    featured: 0,
    outOfStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsSnap, categoriesSnap, featuredSnap, outOfStockSnap] =
          await Promise.all([
            getDocs(collection(db, 'products')),
            getDocs(collection(db, 'categories')),
            getDocs(query(collection(db, 'products'), where('isFeatured', '==', true))),
            getDocs(query(collection(db, 'products'), where('inStock', '==', false))),
          ]);

        setStats({
          products: productsSnap.size,
          categories: categoriesSnap.size,
          featured: featuredSnap.size,
          outOfStock: outOfStockSnap.size,
        });
      } catch {
        setStats({
          products: 0,
          categories: 0,
          featured: 0,
          outOfStock: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
    <h2 className="mb-4 font-outfit text-lg font-semibold text-gray-900 dark:text-white">
        <SectionHeading>Dashboard</SectionHeading>
      </h2>
      <div className="grid grid-cols-2 gap-4 mt-5 lg:grid-cols-4">
        {statConfig.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}
              >
                <Icon className={`h-6 w-6 ${item.text}`} />
              </div>
              <p className="font-outfit text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? '—' : stats[item.key]}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      <h2 className="mb-4 mt-8 font-outfit text-lg font-semibold text-gray-900 dark:text-white">
        <SectionHeading>Quick Actions</SectionHeading>
      </h2>
      <div className="flex flex-col gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/products/new')}
          className="rounded-xl bg-[var(--primary-dark)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          Add New Product
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/categories')}
          className="rounded-xl border border-[var(--primary-dark)] px-6 py-3 text-sm font-semibold text-[var(--primary-dark)] transition-colors hover:bg-primary/5"
        >
          Manage Categories
        </motion.button>
      </div>
    </div>
  );
}
