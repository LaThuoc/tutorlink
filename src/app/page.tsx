import { createClient } from "../utils/supabase/server";
export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("test_connection")
    .select("*");

  if (error) {
    return <p>Lỗi: {error.message}</p>;
  }

  return (
    <main>
      <h1>Test Supabase</h1>

      {data.map((item) => (
        <div key={item.id}>
          <p>ID: {item.id}</p>
          <p>Message: {item.message}</p>
        </div>
      ))}
    </main>
  );
}