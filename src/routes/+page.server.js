// src/routes/+page.server.js
export async function load({ fetch }) {
  console.log("Load Fetch");
  const response = await fetch('http://localhost:3001/api/subjects');
  const dataPdfSubjects = await response.json();

  return {
    dataPdfSubjects // Directly return the data, no "props" wrapper
  };
}
