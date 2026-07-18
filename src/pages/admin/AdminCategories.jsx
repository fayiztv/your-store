import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import GlassCard from "../../components/common/GlassCard";
import useCategories from "../../hooks/useCategories";
import { db } from "../../firebase/firebase";
import {
  cardVariantsAdminCategory,
  containerVariantsAdminCategory,
} from "../../utils/constents";
import { SectionHeading } from "../../components/common/sectionHeading";

export default function AdminCategories() {
  const { categories } = useCategories();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setAdding(true);
    try {
      await addDoc(collection(db, "categories"), {
        name,
        createdAt: serverTimestamp(),
      });
      toast.success("Category added");
      setNewName("");
    } catch {
      toast.error("Failed to add category");
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit(id) {
    const name = editName.trim();
    if (!name) return;

    try {
      await updateDoc(doc(db, "categories", id), { name });
      toast.success("Category updated");
      setEditingId(null);
      setEditName("");
    } catch {
      toast.error("Failed to update category");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const [oldProductsSnap, newProductsSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "products"),
            where("categoryId", "==", deleteTarget.id),
          ),
        ),
        getDocs(
          query(
            collection(db, "products"),
            where("categoryIds", "array-contains", deleteTarget.id),
          ),
        ),
      ]);

      // Remove duplicates (during migration a product may contain both fields)
      const usedProducts = new Map();

      oldProductsSnap.docs.forEach((doc) => usedProducts.set(doc.id, doc));

      newProductsSnap.docs.forEach((doc) => usedProducts.set(doc.id, doc));

      if (usedProducts.size > 0) {
        toast.error(
          `Cannot delete — ${usedProducts.size} product${usedProducts.size > 1 ? "s" : ""} use this category`,
        );
        setDeleteTarget(null);
        return;
      }

      await deleteDoc(doc(db, "categories", deleteTarget.id));

      toast.success("Category deleted");
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <SectionHeading>Categories</SectionHeading>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-dark)] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <motion.button
            type="submit"
            disabled={adding || !newName.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add"}
          </motion.button>
        </form>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            No categories yet. Add one above.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariantsAdminCategory}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence>
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={cardVariantsAdminCategory}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900"
              >
                {editingId === cat.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-dark)] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat.id)}
                        className="flex-1 rounded-lg bg-[var(--primary-dark)] py-1.5 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium dark:border-gray-600 dark:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="truncate font-outfit font-semibold text-gray-900 dark:text-white">
                      {cat.name}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                        }}
                        className="rounded-lg p-2 text-[var(--primary-dark)] transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        aria-label="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <GlassCard className="p-6">
                <h3 className="font-outfit text-lg font-bold text-[var(--text-primary)]">
                  Delete Category?
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {deleteTarget.name}
                  </span>
                  ? This cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-70"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
