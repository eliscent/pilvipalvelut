export async function fetchRandomProduct() {
  const res = await fetch("https://dummyjson.com/products");
  const data = await res.json();

  const products = data.products;
  const randomIndex = Math.floor(Math.random() * products.length);

  return products[randomIndex];
}