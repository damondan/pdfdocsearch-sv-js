// src/routes/+page.server.js
export async function load({ fetch }) {
  const response = await fetch('http://localhost:3001/api/subjects');
  const dataPdfSubjects = await response.json();

  return {
    dataPdfSubjects // Directly return the data, no "props" wrapper
  };
}

//Next, create the post operation or put operation to send off the checked pdf books.