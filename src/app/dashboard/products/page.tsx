'use client';

import { ProductList } from "@/components/dashboard/product-list";
import { BundleProductTable } from "@/components/dashboard/bundle-product-table";

export default function ProductsPage() {
    return (
        <main className="p-4 sm:px-6 md:p-8 space-y-8">
            <ProductList />
            <BundleProductTable />
        </main>
    );
}
