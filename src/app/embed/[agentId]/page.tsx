import React from "react";

// The type for params is correctly defined as a Promise 
// that will resolve to an object containing the 'id'.
type PageParams = Promise<{ id: string }>;

interface CategoryDetailPageProps {
  params: PageParams;
}

// 1. The component is declared as an `async` function.
// This allows us to use the `await` keyword inside it.
export default async function CategoryDetail({ params }: CategoryDetailPageProps) {
  
  // 2. We `await` the `params` Promise to resolve. 
  // Once it resolves, we can destructure the `id` from the resulting object.
  const { id } = await params;

  // Now you can use the resolved 'id' variable in your component logic,
  // for example, to fetch more data specific to this category.
  // const categoryData = await fetchCategoryDetails(id);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Category Details</h1>
      <p className="mt-4">
        Displaying details for Category ID: 
        <span className="ml-2 font-mono bg-gray-200 px-2 py-1 rounded-md">{id}</span>
      </p>
      {/* You would render the rest of your component here, 
        using the fetched categoryData.
      */}
    </main>
  );
}

// This function might be used to pre-build pages, which is one
// of the scenarios where params can be a Promise.
export async function generateStaticParams() {
  // In a real app, you might fetch these IDs from a database or API.
  const categories = [{ id: "electronics" }, { id: "books" }];
  
  return categories.map((category) => ({
    id: category.id,
  }));
}
